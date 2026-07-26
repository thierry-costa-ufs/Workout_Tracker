import { appTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { planningStyles } from '../styles/planningStyles';

interface PlanListItemProps {
  item: { id: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => Promise<void>;
}

export function PlanListItem({ item, isSelected, onSelect, onDelete }: PlanListItemProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <View style={[planningStyles.planItemCard, isSelected && planningStyles.planItemCardActive]}>
      <TouchableOpacity style={{ flex: 1, paddingVertical: 14 }} onPress={onSelect}>
        <Text
          style={[planningStyles.planItemName, isSelected && planningStyles.planItemNameActive]}
          numberOfLines={1}
        >
          {item.name.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {isConfirming ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={planningStyles.confirmDeleteBadge}
            onPress={async () => {
              await onDelete();
              setIsConfirming(false);
            }}
          >
            <Text style={planningStyles.confirmDeleteText}>EXCLUIR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ padding: 6 }} onPress={() => setIsConfirming(false)}>
            <Ionicons name="close" size={18} color={appTheme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{ padding: 10 }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsConfirming(true);
          }}
        >
          <Ionicons name="trash-outline" size={18} color={appTheme.colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}
