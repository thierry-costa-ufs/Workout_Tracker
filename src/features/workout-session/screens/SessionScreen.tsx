import { useTemplates } from '@/context/TemplatesContext';
import { usePersonalRecords } from '@/context/PersonalRecordsContext';
import { DAY_LABELS, getWorkoutDayKeyForToday } from '@/core/constants/days';
import { AppScreen } from '@/core/ui/AppScreen';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { useActiveTemplate } from '@/shared/hooks/useActiveTemplate';
import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { appTheme } from '@/shared/constants/theme';
import { WorkoutSessionView } from '../views/WorkoutSessionView';
import { sessionStyles as styles } from '../styles/sessionStyles';

export default function SessionScreen() {
  const activeTemplate = useActiveTemplate();
  const { isLoading } = useTemplates();
  const { personalRecords } = usePersonalRecords();
  const currentDayKey = getWorkoutDayKeyForToday();

  const todayExercises = useMemo(() => {
    if (!activeTemplate) {
      return [];
    }

    return activeTemplate.data[currentDayKey] || [];
  }, [activeTemplate, currentDayKey]);

  if (isLoading) {
    return (
      <View style={sharedScreenStyles.emptyStateContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.textPrimary} />
      </View>
    );
  }

  if (!activeTemplate) {
    return (
      <View style={sharedScreenStyles.emptyStateContainer}>
        <Text style={sharedScreenStyles.emptyStateTitle}>NENHUMA ROTINA ATIVA SELECIONADA.</Text>
        <Text style={sharedScreenStyles.emptyStateText}>
          Vá até a aba de Planejamento e monte/ative uma divisão de treino.
        </Text>
      </View>
    );
  }

  return (
    <AppScreen style={sharedScreenStyles.container} backgroundColor={appTheme.colors.surface}>
      <View style={sharedScreenStyles.pageHeader}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageSubtitle}>SESSÃO DE TREINO</Text>
          <Text style={sharedScreenStyles.pageTitle}>{activeTemplate.name.toUpperCase()}</Text>
          <Text style={styles.daySubtitle}>{DAY_LABELS[currentDayKey]}</Text>
        </View>
      </View>

      <View style={styles.contentBody}>
        <WorkoutSessionView
          exercises={todayExercises}
          personalRecords={personalRecords}
          templateId={activeTemplate.id}
          dayKey={currentDayKey}
        />
      </View>
    </AppScreen>
  );
}
