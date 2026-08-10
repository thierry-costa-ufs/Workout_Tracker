import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REST_TIMER_CHANNEL = 'rest-timer';

export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const ensureRestTimerChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REST_TIMER_CHANNEL, {
      name: 'Intervalo de série',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const ensurePermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
};

export const scheduleCompletion = async (seconds: number): Promise<string> =>
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Intervalo encerrado',
      body: 'Hora de voltar ao treino',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: REST_TIMER_CHANNEL,
    },
  });

export const cancelTimerNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
