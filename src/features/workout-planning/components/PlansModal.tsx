import { Ionicons } from '@expo/vector-icons';
import { hapticNotify } from '@/core/utils/haptics';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from '@/shared/ui/Overlay';
import { appTheme } from '@/shared/constants/theme';
import { WorkoutTemplate } from '@/types/workout';
import { PlanListItem } from './PlanListItem';
import { planningStyles as styles } from '../styles/planningStyles';

interface PlansModalProps {
  visible: boolean;
  onClose: () => void;
  templates: WorkoutTemplate[];
  activeId: string | null;
  onSelectTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => Promise<void>;
}

export function PlansModal({
  visible,
  onClose,
  templates,
  activeId,
  onSelectTemplate,
  onDeleteTemplate,
}: PlansModalProps) {
  return (
    <Overlay visible={visible} onClose={onClose} animationType="fade">
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>ROTINAS SALVAS</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeModalHeaderBtn}>
          <Ionicons name="close" size={20} color={appTheme.colors.white} />
        </TouchableOpacity>
      </View>

      {templates.length === 0 ? (
        <Text style={styles.emptyPlansText}>Nenhum modelo estruturado.</Text>
      ) : (
        <FlatList
          data={templates}
          extraData={[templates, activeId]}
          keyExtractor={(item) => item.id}
          style={styles.fullWidthMaxHeight}
          renderItem={({ item }) => (
            <PlanListItem
              item={item}
              isSelected={item.id === activeId}
              onSelect={() => {
                onSelectTemplate(item.id);
                onClose();
              }}
              onDelete={async () => {
                await onDeleteTemplate(item.id);
                hapticNotify();
              }}
            />
          )}
        />
      )}
    </Overlay>
  );
}
