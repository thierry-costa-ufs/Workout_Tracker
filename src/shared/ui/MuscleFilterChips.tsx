import { MUSCLE_FILTERS, MuscleFilterType } from '@/core/constants/days';
import { appTheme } from '@/shared/constants/theme';
import { filterChipStyles as styles } from '@/shared/styles/filterChipStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{muscle}</Text>
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
