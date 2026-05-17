import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export function DaySelector({ label, isActive, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, isActive && styles.containerActive]}
    >
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#333", // Cinza escuro para dias inativos
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  containerActive: {
    backgroundColor: "#007AFF", // Azul para o dia ativo
  },
  label: {
    color: "#888",
    fontWeight: "bold",
  },
  labelActive: {
    color: "#FFF",
  },
});
