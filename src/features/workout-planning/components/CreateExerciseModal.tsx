import { appTheme } from '@/shared/constants/theme';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Overlay } from '@/shared/ui/Overlay';
import { MuscleGroup, EquipmentType } from '@/types/workout';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito',
  'Costas',
  'Ombro',
  'Quadríceps',
  'Posterior',
  'Panturrilha',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Trapézio',
  'Abdômen',
];
const EQUIPMENTS: EquipmentType[] = ['Barra', 'Halter', 'Polia', 'Máquina', 'Peso Corporal'];

export interface CustomExerciseData {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
}

interface CreateExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (exercise: CustomExerciseData) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Peito');
  const [equipment, setEquipment] = useState<EquipmentType>('Barra');

  const handleSave = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      muscleGroup,
      equipment,
    });

    setName('');
    setMuscleGroup('Peito');
    setEquipment('Barra');
    onClose();
  };

  return (
    <Overlay visible={visible} animationType="fade" onClose={onClose}>
      <Text style={styles.title}>Novo Exercício Personalizado</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nome do Exercício</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supino Inclinado com Halteres"
          placeholderTextColor={appTheme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Grupo Muscular</Text>
        <View style={styles.chipContainer}>
          {MUSCLE_GROUPS.map((group) => {
            const isSelected = muscleGroup === group;
            return (
              <TouchableOpacity
                key={group}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setMuscleGroup(group)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {group}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Equipamento</Text>
        <View style={styles.chipContainer}>
          {EQUIPMENTS.map((eq) => {
            const isSelected = equipment === eq;
            return (
              <TouchableOpacity
                key={eq}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setEquipment(eq)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{eq}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: appTheme.colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: appTheme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: appTheme.colors.textPrimary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.background,
  },
  chipSelected: {
    backgroundColor: appTheme.colors.white,
    borderColor: appTheme.colors.white,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
  },
  chipTextSelected: {
    color: appTheme.colors.textInverse,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: appTheme.colors.background,
  },
  saveButton: {
    backgroundColor: appTheme.colors.background,
  },
  cancelText: {
    color: appTheme.colors.textPrimary,
    fontWeight: '600',
  },
  saveText: {
    color: appTheme.colors.textPrimary,
    fontWeight: '600',
  },
});
