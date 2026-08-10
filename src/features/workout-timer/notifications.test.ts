import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  REST_TIMER_CHANNEL,
  cancelTimerNotifications,
  configureNotificationHandler,
  ensurePermissions,
  ensureRestTimerChannel,
  scheduleCompletion,
} from '@/features/workout-timer/notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

const mock = Notifications as jest.Mocked<typeof Notifications>;

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures the foreground handler', () => {
    configureNotificationHandler();
    expect(mock.setNotificationHandler).toHaveBeenCalledTimes(1);
    const handler = mock.setNotificationHandler.mock.calls[0]![0];
    expect(handler).not.toBeNull();
    expect(handler?.handleNotification).toBeInstanceOf(Function);
  });

  it('returns early when permission already granted', async () => {
    mock.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    await expect(ensurePermissions()).resolves.toBe(true);
    expect(mock.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission when not yet granted', async () => {
    mock.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as never);
    mock.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    await expect(ensurePermissions()).resolves.toBe(true);
    expect(mock.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('creates the android channel on android', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });
    await ensureRestTimerChannel();
    Object.defineProperty(Platform, 'OS', { get: () => original });
    expect(mock.setNotificationChannelAsync).toHaveBeenCalledWith(REST_TIMER_CHANNEL, {
      name: 'Intervalo de série',
      importance: 4,
    });
  });

  it('skips the channel on non-android', async () => {
    await ensureRestTimerChannel();
    expect(mock.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('schedules a completion notification with an interval trigger', async () => {
    mock.scheduleNotificationAsync.mockResolvedValue('id-1' as never);
    const id = await scheduleCompletion(90);
    expect(id).toBe('id-1');
    expect(mock.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Intervalo encerrado', body: 'Hora de voltar ao treino' },
      trigger: {
        type: 'timeInterval',
        seconds: 90,
        channelId: REST_TIMER_CHANNEL,
      },
    });
  });

  it('cancels all scheduled notifications', async () => {
    await cancelTimerNotifications();
    expect(mock.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
