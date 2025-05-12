import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { Camera, MapPin, Bell, Lock, LogOut } from 'lucide-react-native';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Kullanıcı verilerini çekme
  const fetchUserData = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      Alert.alert('Hata', 'Kullanıcı oturumu alınamadı: ' + authError.message);
      return;
    }

    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, surname, email, phone')
        .eq('id', user.id)
        .single();

      if (error) {
        Alert.alert('Hata', 'Kullanıcı profil bilgileri alınamadı: ' + error.message);
      } else {
        setName(data?.name || 'Ad Belirtilmemiş');
        setSurname(data?.surname || 'Soyad Belirtilmemiş');
        setEmail(data?.email || user.email);
        setPhone(data?.phone || 'Telefon Numarası Belirtilmemiş');
      }
    } else {
      router.replace('/login');
    }

    setLoading(false);
  };

  // useEffect ile kullanıcı verilerini çekme ve oturum durumu değişikliklerini izleme
  useEffect(() => {
    fetchUserData();

    // Kullanıcı oturum durumu değiştiğinde veri yenileme
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData();
      } else {
        router.replace('/login');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Burada boş bağımlılık, sadece ilk renderda çalışacak

  // Çıkış yapma işlemi
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                'https://previews.123rf.com/images/pandavector/pandavector1607/pandavector160700160/60027009-cone-de-menina-plana-nico-avatar-%C3%ADcone-de-pessoas-da-grande-cole%C3%A7%C3%A3o-de-avatar-banco-de.jpg',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{`${name || ''} ${surname || ''}`}</Text>
        {/* Lokasyon */}
        <Text style={styles.location}>İstanbul, Türkiye</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput style={styles.input} value={`${name} ${surname}`} editable={false} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput style={styles.input} value={email} editable={false} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput style={styles.input} value={phone} editable={false} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color="#666" />
            <Text style={styles.settingText}>Bildirimler</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ddd', true: '#e65c00' }}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MapPin size={20} color="#666" />
            <Text style={styles.settingText}>Konum Servisleri</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#ddd', true: '#e65c00' }}
          />
        </View>
        <TouchableOpacity style={styles.settingButton}>
          <Lock size={20} color="#666" />
          <Text style={styles.settingButtonText}>Şifre Değiştir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="white" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// styles aynı kalabilir (dilersen güncelleyebilirim)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#e65c00',
    borderRadius: 15,
    padding: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  settingButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#e65c00',
  },
  logoutButton: {
    backgroundColor: '#e65c00',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});
