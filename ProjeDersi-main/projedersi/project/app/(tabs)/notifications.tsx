import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { supabase } from '@/supabaseClient';

type Notification = {
  id: string;
  type: 'new_station' | 'refill_needed' | 'thank_you' | 'water_help' | 'food_help';
  title: string;
  message?: string;
  timestamp: string;
  userImage?: string;
  location?: string;
  userName?: string;
  stationName?: string;
};

const createMessage = (type: Notification['type'], userName?: string, stationName?: string): string => {
  switch (type) {
    case 'new_station':
      return `${userName ?? 'Bir kullanıcı'} yeni bir istasyon ekledi.`;
    case 'food_help':
      return `${userName ?? 'Bir kullanıcı'} ${stationName ?? 'bir istasyona'} mama yardımı yaptı.`;
    case 'water_help':
      return `${userName ?? 'Bir kullanıcı'} ${stationName ?? 'bir istasyona'} su götürdü.`;
    case 'thank_you':
      return `${userName ?? 'Bir kullanıcı'} mama istasyonunu doldurdu.`;
    case 'refill_needed':
      return `${stationName ?? 'Bir istasyonda'} mama azaldı.`;
    default:
      return '';
  }
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
    } else {
      const mapped = data?.map((item: any) => ({
        ...item,
        userImage: item.userImage ?? 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        stationName: item.station_name ?? 'Mama istasyonu',
      })) || [];
      setNotifications(mapped);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Gerçek zamanlı dinleme
    const subscription = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          fetchNotifications(); // Yeni bildirim geldiğinde listeyi yenile
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={styles.notificationCard}>
      <Image
        source={{ uri: item.userImage }}
        style={styles.userImage}
      />
      <View style={styles.notificationFooter}>
  <View style={styles.locationContainer}>
    <MapPin size={14} color="#666" />
    <Text style={styles.locationText}>{item.stationName}</Text>
  </View>
  <View style={styles.timeContainer}>
    <Clock size={14} color="#666" />
    <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
  </View>
</View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65c00',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});
