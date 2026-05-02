import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Helper to get the notifications library safely.
 * In Expo Go on Android, push notification functionality is removed and can cause errors.
 */
const getNotifications = () => {
  try {
    return require('expo-notifications');
  } catch (e) {
    console.warn('expo-notifications could not be loaded:', e);
    return null;
  }
};

// Initialize the notification handler
if (!isExpoGo || Platform.OS === 'ios') {
  const Notifications = getNotifications();
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}

export async function registerForPushNotificationsAsync() {
  // Push notifications are not supported in Expo Go on Android since SDK 53
  if (isExpoGo && Platform.OS === 'android') {
    console.warn('Push notifications (remote) are not supported in Expo Go on Android. Please use a development build.');
    return;
  }

  const Notifications = getNotifications();
  if (!Notifications) return;

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#408A71',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('Project ID not found in app config. Skipping token retrieval.');
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log('Push Token:', token);
    } catch (e) {
      console.log('Error fetching push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null,
    });
  } catch (e) {
    console.error('Failed to send local notification:', e);
  }
}
