import { supabase } from '@/supabaseClient';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const API_KEY = 'AIzaSyDUYJ6VBRz4bsWT7ZCwi9Amh1bjPnqoGiM';

const addHelpNotification = async (
  stationId: string,
  type: 'water' | 'food',
  userName: string
) => {
  const stationName = await getStationNameById(stationId);
  const { data, error } = await supabase
    .from('help_notifications')
    .insert([
      {
        type: type === 'water' ? 'water_help' : 'food_help',
        station_name: stationName,
        station_id: stationId,
        user_name: userName,
      },
    ])
    .select();

  if (error) {
    console.error('Yardım kaydedilirken hata:', error);
  } else {
    console.log('Yardım kaydedildi:', data);
    await addNotification(
      type === 'water' ? 'water_help' : 'food_help',
      userName,
      stationId
    );
  }
};

const addNotification = async (
  type: 'food_help' | 'water_help',
  userName: string,
  stationId: string
) => {
  const stationName = await getStationNameById(stationId);
  const { data, error } = await supabase.from('notifications').insert([
    {
      type,
      title: type === 'food_help' ? 'Mama Yardımı' : 'Su Yardımı',
      message: `${userName} adlı kullanıcı ${stationName} istasyonuna yardım yaptı.`,
      user_name: userName,
      station_name: stationName,
    },
  ]);

  if (error) {
    console.error('Bildirim eklenirken hata:', error);
  } else {
    console.log('Bildirim eklendi:', data);
  }
};

const getStationNameById = async (stationId: string) => {
  const { data, error } = await supabase
    .from('feeding_stations')
    .select('name')
    .eq('id', stationId)
    .single();

  if (error) {
    console.error('İstasyon adı alınırken hata:', error);
    return '';
  }

  return data ? data.name : '';
};

export default function NativeMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [stationName, setStationName] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [coordinate, setCoordinate] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [userName, setUserName] = useState('Misafir');

  useEffect(() => {
    fetchStations();
    fetchUserName(); // Kullanıcı adını al
  }, []);

  // Kullanıcı adı (name ve surname) bilgilerini almak için
  const fetchUserName = async () => {
    const { data: user, error } = await supabase.auth.getUser(); // getUser() kullanımı
    if (user && user.user) { // user'ın null olmadığını kontrol et
      const { data, error } = await supabase
        .from('profiles') // Kullanıcı profil bilgilerini aldığımız tablo
        .select('name, surname')
        .eq('id', user.user.id) // user.user.id'yi kullan
        .single();
    
      if (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
      } else if (data) {
        setUserName(`${data.name} ${data.surname}`); // name ve surname'yi birleştirip kullanıcı adı olarak ayarla
      }
    } else {
      console.log('Kullanıcı oturumu yok');
      setUserName('Misafir');  // Varsayılan kullanıcı adı "Misafir" olarak ayarlandı
    }
  };
  
  

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('feeding_stations')
      .select('*');
    if (error) {
      console.error('İstasyonlar alınırken hata:', error);
    } else if (data) {
      const formatted = data.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.name,
        description: `${item.district} - Durum: ${item.status}`,
      }));
      setMarkers(formatted);
    }
  };

  const handleMapPress = async (e: any) => {
    console.log('Haritaya tıklandı!', e.nativeEvent.coordinate); 
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoordinate(e.nativeEvent.coordinate);
    setShowForm(true);
    console.log("Form gösteriliyor mu?", showForm);
    setSelectedStation(null);
   
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const mahalle = addressComponents.find((component: any) =>
          component.types.includes('neighborhood') ||
          component.types.includes('sublocality') ||
          component.types.includes('administrative_area_level_4') ||
          component.types.includes('locality')
        );
        setSelectedArea(mahalle ? mahalle.long_name : 'Mahalle bulunamadı');
      } else {
        setSelectedArea('Mahalle alınamadı');
      }
    } catch (error) {
      console.error('Geocode Hatası:', error);
      setSelectedArea('Mahalle alınırken hata oluştu');
    }
  };

  const addStation = async () => {
    if (!stationName || !status || !coordinate || !selectedArea) {
      Alert.alert(
        'Eksik bilgiler',
        'Lütfen istasyon adı, durumu ve harita üzerindeki noktayı belirleyin.'
      );
      return;
    }

    const { data, error } = await supabase
      .from('feeding_stations')
      .insert([
        {
          name: stationName,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          district: selectedArea,
          status: status,
        },
      ])
      .select();

    if (error || !data) {
      console.error('İstasyon eklenirken hata:', error);
      Alert.alert('Hata', 'İstasyon veritabanına kaydedilemedi.');
    } else {
      Alert.alert('Başarılı', 'İstasyon başarıyla eklendi!');
      const newMarker = {
        id: data[0]?.id ?? String(new Date().getTime()),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        title: stationName,
        description: `${selectedArea} - Durum: ${status}`,
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setStationName('');
      setStatus('');
      setShowForm(false);
    }
  };

  const deleteStation = async (stationId: number) => {
    Alert.alert('İstasyonu Sil', 'Bu istasyonu silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('feeding_stations')
            .delete()
            .eq('id', stationId);

          if (error) {
            console.error('Silme hatası:', error);
            Alert.alert('Hata', 'İstasyon silinemedi.');
          } else {
            Alert.alert('Başarılı', 'İstasyon silindi.');
            setMarkers((prevMarkers) =>
              prevMarkers.filter((marker) => marker.id !== stationId)
            );
            setSelectedStation(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="İstasyon Adı"
            value={stationName}
            onChangeText={setStationName}
          />
          <TextInput
            style={styles.input}
            placeholder="Mahalle"
            value={selectedArea}
            editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Durum"
            value={status}
            onChangeText={setStatus}
          />
          <Button title="İstasyon Ekle" onPress={addStation} />
          <Button title="İptal Et" onPress={() => setShowForm(false)} />
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.6761,
          longitude: 26.5557,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => {
              setSelectedStation(marker);
              setShowHelpOptions(false);
              setShowForm(false);
            }}
          />
        ))}
      </MapView>

      {selectedStation && (
        <View style={styles.profileContainer}>
          <Text style={styles.profileTitle}>{selectedStation.title}</Text>
          <Text>{selectedStation.description}</Text>
          <Button title="Yardım Et" onPress={() => setShowHelpOptions(true)} />
          {showHelpOptions && (
            <View style={styles.helpButtons}>
              <Button
                title="Su Götürdüm"
                onPress={async () => {
                  await addHelpNotification(selectedStation.id, 'water', userName);
                  Alert.alert('Teşekkürler!', 'Su yardımı bildirildi.');
                  setShowHelpOptions(false);
                  setSelectedStation(null);
                }}
              />
              <Button
                title="Mama Götürdüm"
                onPress={async () => {
                  await addHelpNotification(selectedStation.id, 'food', userName);
                  Alert.alert('Teşekkürler!', 'Mama yardımı bildirildi.');
                  setShowHelpOptions(false);
                  setSelectedStation(null);
                }}
              />
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            <Button
              title="İstasyonu Sil"
              color="red"
              onPress={() => deleteStation(selectedStation.id)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  formContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  profileContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  profileTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
}); 