import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importing all screen functions
import {WelcomeScreen} from '../screens/WelcomeScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {WalletScreen} from '../screens/WalletScreen';
import {SecurityScreen} from '../screens/SecurityScreen';
import {RecalibrateScreen} from '../screens/RecalibrateScreen';

import {palette, typography} from '../tokens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color, size}) => {
          let iconName = 'error';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Wallet') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Security') {
            iconName = 'security';
          }

          return <Icon name={iconName} size={size + 4} color={color} />;
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.bg,
          borderTopWidth: 1,
          borderTopColor: palette.border,
          elevation: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: typography.primaryMedium,
          fontSize: 12,
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Security" component={SecurityScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    // Set initialRouteName to "Welcome" so it loads first
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="Recalibrate"
        component={RecalibrateScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack.Navigator>
  );
}