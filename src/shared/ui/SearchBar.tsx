import { Ionicons } from '@expo/vector-icons';
import { appTheme } from '@/shared/constants/theme';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar exercício...',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[s.container, focused && s.containerFocused]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? appTheme.colors.textPrimary : appTheme.colors.textSecondary}
      />
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={appTheme.colors.textMuted}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={18} color={appTheme.colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  containerFocused: {
    borderColor: appTheme.colors.textPrimary,
  },
  input: {
    flex: 1,
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
