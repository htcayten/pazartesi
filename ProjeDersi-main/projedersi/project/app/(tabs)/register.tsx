import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
  });

  const handleRegister = async () => {
    console.log('Kayıt işlemi başladı');
    const [name, ...surnameParts] = formData.fullName.trim().split(' ');
    const surname = surnameParts.join(' ');

    // Supabase üzerinden kullanıcı kaydı
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error('Kayıt hatası:', error.message);
      return;
    }

    // Kullanıcı kaydı başarılıysa, profili oluştur
    const { user } = data;

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user?.id,  // auth kullanıcısının id'si
        name: name,
        surname: surname,
        phone: formData.phone,
        location: formData.location || 'Edirne', // Varsayılan Edirne
      },
    ]);

    if (profileError) {
      console.error('Profil kaydı hatası:', profileError.message);
    } else {
      console.log('Kullanıcı kaydı başarılı!');

      // Profil verisini almak için select ekleyelim
      const { data: profileData, error: profileSelectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)  // Kullanıcının ID'sini kullanarak profili çekiyoruz
        .single();  // Tek bir sonuç almak için

      if (profileSelectError) {
        console.error('Profil verisi çekilemedi:', profileSelectError.message);
      } else {
        console.log('Profil verisi:', profileData);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Bilgilerim</Text>

        <TextInput
          style={styles.input}
          placeholder="Adı Soyadı"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="E-Posta"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Telefon Numarası"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

       

        <Text style={styles.sectionTitle}>Şifrem</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <Text style={styles.terms}>
          Kişisel Verilerin Korunması ve İşlenmesine İlişkin Aydınlatma Metni'ni okudum, anladım. KVKK gereği kişisel verilerin korunması amacıyla KVKK'ya uygun bir şekilde işlenmesine ve saklanmasına rıza gösteriyorum.
        </Text>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>KAYDET</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e65c00',
    marginTop: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e65c00',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  locationButton: {
    height: 50,
    backgroundColor: '#e65c00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: '#e65c00',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
