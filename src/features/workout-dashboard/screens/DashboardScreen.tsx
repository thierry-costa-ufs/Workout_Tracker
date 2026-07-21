import { useWorkouts } from "@/context/WorkoutContext";
import { appTheme } from "@/shared/constants/theme";
import { AppScreen } from "@/shared/ui/AppScreen";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const { activeId, templates } = useWorkouts();

  const currentTemplate = templates.find((template) => template.id === activeId);

  const handleNavigation = (route: string) => {
    try {
      router.push(route as never);
    } catch {
      console.log(`Rota ${route} não encontrada.`);
    }
  };

  return (
    <AppScreen style={styles.container} backgroundColor={appTheme.colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.brandSubtitle}>DESAFIE A SUA NATUREZA</Text>
            <Text style={styles.brandTitle}>PRÁXIS</Text>
          </View>
        </View>

        <View style={styles.mainHeroCard}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroTag}>DIVISÃO DE TREINO ATUAL</Text>
          </View>

          <Text style={styles.heroCardTitle}>
            {currentTemplate ? currentTemplate.name.toUpperCase() : "NENHUM BLOCADO"}
          </Text>
          <Text style={styles.heroCardSubtitle}>
            Monitore seu volume total de treino, descanso e RPE. Só assim você gera hipertrofia com uma sobrecarga progressiva controlada.
          </Text>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => handleNavigation("/session")}>
            <Text style={styles.primaryButtonText}>INICIAR SESSÃO</Text>
            <Feather name="arrow-right" size={16} color={appTheme.colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SISTEMAS DE TREINAMENTO</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7} onPress={() => handleNavigation("/planning")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>01</Text>
              <Feather name="sliders" size={16} color="#48484A" />
            </View>
            <View>
              <Text style={styles.cardTitle}>DIVISÃO DE TREINO</Text>
              <Text style={styles.cardDescription}>Estruturação de microciclos, mesociclos e distribuição de volume semanal.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7} onPress={() => handleNavigation("/record")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>02</Text>
              <Feather name="bar-chart-2" size={16} color="#48484A" />
            </View>
            <View>
              <Text style={styles.cardTitle}>CARGA RESTRITA</Text>
              <Text style={styles.cardDescription}>Histórico absoluto de tonelagem levantada e evolução linear de marcas.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7} onPress={() => handleNavigation("/timer")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>03</Text>
              <Feather name="clock" size={16} color="#48484A" />
            </View>
            <View>
              <Text style={styles.cardTitle}>TEMPO DE RECUPERAÇÃO</Text>
              <Text style={styles.cardDescription}>Controle rígido do reabastecimento de ATP e densidade do treino.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7} onPress={() => handleNavigation("/exercises")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>04</Text>
              <Feather name="book-open" size={16} color="#48484A" />
            </View>
            <View>
              <Text style={styles.cardTitle}>MECÂNICA E ANATOMIA</Text>
              <Text style={styles.cardDescription}>Biblioteca técnica de seleção de exercícios por plano anatômico.</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBanner}>
          <Text style={styles.footerText}>CONSISTÊNCIA EM ALTA INTENSIDADE // ATÉ A FALHA CONCÊNTRICA</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,
  scrollContent: {
    paddingBottom: 40,
  } satisfies ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  } satisfies ViewStyle,
  titleBlock: {
    flex: 1,
  } satisfies ViewStyle,
  brandSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 2,
  } satisfies TextStyle,
  brandTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
  } satisfies TextStyle,
  mainHeroCard: {
    backgroundColor: appTheme.colors.surface,
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    marginBottom: 32,
  } satisfies ViewStyle,
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } satisfies ViewStyle,
  heroTag: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  } satisfies TextStyle,
  heroCardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
  } satisfies TextStyle,
  heroCardSubtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  } satisfies TextStyle,
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  } satisfies ViewStyle,
  primaryButtonText: {
    color: appTheme.colors.textInverse,
    fontWeight: "900",
    letterSpacing: 1,
  } satisfies TextStyle,
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  } satisfies ViewStyle,
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginRight: 10,
  } satisfies TextStyle,
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: appTheme.colors.border,
  } satisfies ViewStyle,
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 12,
  } satisfies ViewStyle,
  featureCard: {
    width: (width - 24 * 2 - 12) / 2,
    backgroundColor: appTheme.colors.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    minHeight: 140,
    justifyContent: "space-between",
  } satisfies ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  } satisfies ViewStyle,
  cardIndex: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  } satisfies TextStyle,
  cardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  } satisfies TextStyle,
  cardDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  } satisfies TextStyle,
  footerBanner: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: appTheme.colors.border,
  } satisfies ViewStyle,
  footerText: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  } satisfies TextStyle,
});
