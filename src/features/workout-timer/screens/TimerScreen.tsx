import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { AppScreen } from '@/core/ui/AppScreen';
import { hapticLight, hapticMedium, hapticNotify } from '@/core/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const MIN_TIMER_SECONDS = 15;

type IconName = keyof typeof Ionicons.glyphMap;

interface Preset {
  id: string;
  label: string;
  duration: number;
  icon: IconName;
}

const TIMER_PRESETS: Preset[] = [
  { id: 'warmup', label: 'AQUECIMENTO', duration: 45, icon: 'flame-outline' },
  {
    id: 'feeder',
    label: 'PREPARO / FEEDER',
    duration: 90,
    icon: 'trending-up-outline',
  },
  {
    id: 'work',
    label: 'SÉRIE DE TRABALHO',
    duration: 120,
    icon: 'barbell-outline',
  },
  { id: 'power', label: 'FORÇA / RPT', duration: 180, icon: 'flash-outline' },
  { id: 'cardio', label: 'CARDIO (HIIT)', duration: 30, icon: 'heart-outline' },
];

export default function TimerScreen() {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [totalDuration, setTotalDuration] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [activePreset, setActivePreset] = useState('feeder');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const totalDurationRef = useRef(totalDuration);

  const notifyFinish = () => {
    hapticNotify();
    if (Platform.OS === 'web') return;
    Vibration.vibrate([0, 500, 200, 500]);
  };

  const tick = useRef(() => {
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining <= 0) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      endTimeRef.current = 0;
      setSecondsLeft(totalDurationRef.current);
      setIsActive(false);
      notifyFinish();
    }
  }).current;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (isActive && secondsLeft > 0) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isActive && endTimeRef.current > 0) {
        tick();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(tick, 1000);
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const toggleTimer = () => {
    hapticMedium();
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    hapticLight();
    setIsActive(false);
    endTimeRef.current = 0;
    setSecondsLeft(totalDurationRef.current);
  };

  const selectPreset = (id: string, duration: number) => {
    hapticMedium();
    setIsActive(false);
    totalDurationRef.current = duration;
    setActivePreset(id);
    setTotalDuration(duration);
    setSecondsLeft(duration);
  };

  const adjustTime = (amount: number) => {
    hapticLight();
    const newTime = Math.max(MIN_TIMER_SECONDS, totalDurationRef.current + amount);
    totalDurationRef.current = newTime;
    setTotalDuration(newTime);
    setSecondsLeft(newTime);
    setIsActive(false);
    setActivePreset('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (secondsLeft / totalDuration) * 100 : 0;

  return (
    <AppScreen style={styles.mainContainer} backgroundColor={appTheme.colors.background}>
      <View style={sharedScreenStyles.pageHeader}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageTitle}>INTERVALO DE SÉRIE</Text>
          <Text style={sharedScreenStyles.pageSubtitle}>CRONOMETRAGEM E CADÊNCIA ESTRATÉGICA</Text>
        </View>
      </View>

      <View style={styles.displayContainer}>
        <View style={styles.outerRing}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.activePresetLabel}>
            {activePreset
              ? TIMER_PRESETS.find((preset) => preset.id === activePreset)?.label
              : 'TEMPO CUSTOMIZADO'}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.adjustmentContainer}>
        <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(-15)}>
          <Text style={styles.adjustButtonText}>-15s</Text>
        </TouchableOpacity>

        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlCircleReset} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color={appTheme.colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlCirclePlay, isActive && styles.controlCirclePause]}
            onPress={toggleTimer}
          >
            <Ionicons
              name={isActive ? 'pause' : 'play'}
              size={32}
              color={appTheme.colors.surfaceElevated}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(15)}>
          <Text style={styles.adjustButtonText}>+15s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsSection}>
        <Text style={styles.sectionTitle}>MÉTODO DE DESCANSO</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
          {TIMER_PRESETS.map((preset) => {
            const isCurrent = activePreset === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  sharedScreenStyles.cardSurface,
                  styles.presetCard,
                  isCurrent && styles.presetCardActive,
                ]}
                onPress={() => selectPreset(preset.id, preset.duration)}
              >
                <View style={styles.presetLeftRow}>
                  <View style={[styles.iconWrapper, isCurrent && styles.iconWrapperActive]}>
                    <Ionicons
                      name={preset.icon}
                      size={16}
                      color={
                        isCurrent ? appTheme.colors.textInverse : appTheme.colors.textSecondary
                      }
                    />
                  </View>
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetLabel, isCurrent && styles.presetLabelActive]}>
                      {preset.label}
                    </Text>
                    <Text style={styles.presetSubtext}>FOCO TÉCNICO</Text>
                  </View>
                </View>

                <View style={styles.presetRightRow}>
                  <Text style={[styles.presetTime, isCurrent && styles.presetTimeActive]}>
                    {formatTime(preset.duration)}
                  </Text>
                  <Ionicons
                    name={isCurrent ? 'ellipse' : 'chevron-forward-outline'}
                    size={12}
                    color={isCurrent ? appTheme.colors.white : appTheme.colors.borderStrong}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: appTheme.colors.background },
  displayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  outerRing: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: appTheme.colors.white,
    fontSize: 54,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  activePresetLabel: {
    color: appTheme.colors.gray,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  progressTrack: {
    width: width * 0.6,
    height: 3,
    backgroundColor: appTheme.colors.surfaceDark,
    borderRadius: 2,
    marginTop: 25,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: appTheme.colors.textPrimary,
    borderRadius: 2,
  },
  adjustmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  adjustButton: {
    backgroundColor: appTheme.colors.background,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adjustButtonText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  mainControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  controlCircleReset: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: appTheme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: appTheme.colors.borderStrong,
  },
  controlCirclePlay: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: appTheme.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlCirclePause: { backgroundColor: appTheme.colors.textPrimary },
  presetsSection: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.surfaceElevated,
  },
  sectionTitle: {
    ...sharedScreenStyles.sectionTitleText,
    color: appTheme.colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    marginRight: 0,
  },
  presetsList: { paddingBottom: 24 },
  presetCard: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.surfaceElevated,
    backgroundColor: appTheme.colors.background,
  },
  presetCardActive: {
    borderColor: appTheme.colors.white,
    backgroundColor: appTheme.colors.surfaceElevated,
  },
  presetLeftRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: appTheme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: { backgroundColor: appTheme.colors.white },
  presetInfo: { marginLeft: 12 },
  presetLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  presetLabelActive: { color: appTheme.colors.white },
  presetSubtext: {
    color: appTheme.colors.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  presetRightRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  presetTime: {
    color: appTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  presetTimeActive: { color: appTheme.colors.white },
});
