import { MUSCLE_FILTERS, MuscleFilterType } from '@/core/constants/days';
import { appTheme } from '@/shared/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MuscleFilterChipsProps {
  value: MuscleFilterType;
  onChange: (muscle: MuscleFilterType) => void;
}

export function MuscleFilterChips({ value, onChange }: MuscleFilterChipsProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
      >
        {MUSCLE_FILTERS.map((muscle) => {
          const isSelected = value === muscle;
          return (
            <TouchableOpacity
              key={muscle}
              onPress={() => onChange(muscle)}
              style={[s.chip, isSelected && s.chipActive]}
            >
              <Text style={[s.chipText, isSelected && s.chipTextActive]}>{muscle}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', appTheme.colors.background]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    flexShrink: 0,
    height: 36,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    borderColor: appTheme.colors.textPrimary,
  },
  chipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: appTheme.colors.textPrimary,
  },
});
