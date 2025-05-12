import { Tabs } from 'expo-router';
import { LogIn, UserPlus, MapPin, Bell, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarActiveTintColor: '#e65c00',
        tabBarInactiveTintColor: 'gray',
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Giriş Yap',
          tabBarIcon: ({ color, size }) => <LogIn size={size} color={color} />,
          headerStyle: {
            backgroundColor: '#e65c00',
          },
          headerTintColor: 'white',
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'Üye Ol',
          tabBarIcon: ({ color, size }) => <UserPlus size={size} color={color} />,
          headerStyle: {
            backgroundColor: '#e65c00',
          },
          headerTintColor: 'white',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mama İstasyonu',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          headerStyle: {
            backgroundColor: '#e65c00',
          },
          headerTintColor: 'white',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          headerStyle: {
            backgroundColor: '#e65c00',
          },
          headerTintColor: 'white',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilim',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerStyle: {
            backgroundColor: '#e65c00',
          },
          headerTintColor: 'white',
        }}
      />
    </Tabs>
  );
}