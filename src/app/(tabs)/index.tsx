import { useWorkouts } from "@/context/WorkoutContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function GymLandingPage() {
  const router = useRouter();
  const { activeId, templates } = useWorkouts();

  const currentTemplate = templates.find((t) => t.id === activeId);

  const handleNavigation = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.log(`Rota ${route} não encontrada.`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER INDUSTRIAL */}
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.brandSubtitle}>DESAFIE A SUA NATUREZA</Text>
              <Text style={styles.brandTitle}>PRÁXIS</Text>
            </View>
          </View>

          {/* CARD DE EXECUÇÃO PRINCIPAL */}
          <View style={styles.mainHeroCard}>
            <View style={styles.heroHeaderRow}>
              <Text style={styles.heroTag}>DIVISÃO DE TREINO ATUAL</Text>
            </View>

            <Text style={styles.heroCardTitle}>
              {currentTemplate
                ? currentTemplate.name.toUpperCase()
                : "NENHUM BLOCADO"}
            </Text>
            <Text style={styles.heroCardSubtitle}>
              Monitore seu volume total de treino, descanso e RPE. Só assim você
              gera hipertrofia com uma sobrecarga progressiva controlada.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => handleNavigation("/session")} // Direciona para a Tab de Sessão de Treino
            >
              <Text style={styles.primaryButtonText}>INICIAR SESSÃO</Text>
              <Feather name="arrow-right" size={16} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* DIVISOR DE SESSÃO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SISTEMAS DE TREINAMENTO</Text>
            <View style={styles.sectionLine} />
          </View>

          {/* GRID OPERACIONAL */}
          <View style={styles.gridContainer}>
            {/* CARD 1 - PLANEJAMENTO */}
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => handleNavigation("/planning")} // Direciona para a Tab de Planejamento
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIndex}>01</Text>
                <Feather name="sliders" size={16} color="#48484A" />
              </View>
              <View>
                <Text style={styles.cardTitle}>DIVISÃO DE TREINO</Text>
                <Text style={styles.cardDescription}>
                  Estruturação de microciclos, mesociclos e distribuição de
                  volume semanal.
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARD 2 - HISTÓRICO */}
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => handleNavigation("/history")}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIndex}>02</Text>
                <Feather name="bar-chart-2" size={16} color="#48484A" />
              </View>
              <View>
                <Text style={styles.cardTitle}>CARGA RESTRITA</Text>
                <Text style={styles.cardDescription}>
                  Histórico absoluto de tonelagem levantada e evolução linear de
                  marcas.
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARD 3 - CRONÔMETRO */}
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => handleNavigation("/timer")} // Direciona para a Tab do Cronômetro
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIndex}>03</Text>
                <Feather name="clock" size={16} color="#48484A" />
              </View>
              <View>
                <Text style={styles.cardTitle}>TEMPO DE RECUPERAÇÃO</Text>
                <Text style={styles.cardDescription}>
                  Controle rígido do reabastecimento de ATP e densidade do
                  treino.
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARD 4 - EXERCÍCIOS */}
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => handleNavigation("/exercises")}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIndex}>04</Text>
                <Feather name="book-open" size={16} color="#48484A" />
              </View>
              <View>
                <Text style={styles.cardTitle}>MECÂNICA E ANATOMIA</Text>
                <Text style={styles.cardDescription}>
                  Biblioteca técnica de seleção de exercícios por plano
                  anatômico.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* RODAPÉ BRUTALISTA */}
          <View style={styles.footerBanner}>
            <Text style={styles.footerText}>
              CONSISTÊNCIA EM ALTA INTENSIDADE // ATÉ A FALHA CONCÊNTRICA
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214", // Fundo geral: Preto fosco / Cinza chumbo profundo
  } satisfies ViewStyle,

  scrollContent: {
    paddingBottom: 40,
  } satisfies ViewStyle,

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: "#1A1A1E", // Bloco ligeiramente mais claro para criar relevo sutil
    borderBottomWidth: 1,
    borderColor: "#26262B", // Linha divisória de baixíssimo contraste
  } satisfies ViewStyle,

  titleBlock: {
    flex: 1,
  } satisfies ViewStyle,

  brandSubtitle: {
    color: "#636366", // Cinza lavado de suporte
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 2,
  } satisfies TextStyle,

  brandTitle: {
    color: "#E5E5EA", // Texto principal: Off-white fosco (reduz o 'glow' e o cansaço visual)
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
  } satisfies TextStyle,

  profileButton: {
    width: 36,
    height: 36,
    backgroundColor: "#121214",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26262B",
    borderRadius: 0,
  } satisfies ViewStyle,

  /* HERO CARD */
  mainHeroCard: {
    backgroundColor: "#1A1A1E", // Card principal destacando-se do fundo #121214
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#26262B",
    marginBottom: 32,
  } satisfies ViewStyle,

  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } satisfies ViewStyle,

  heroTag: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  } satisfies TextStyle,

  heroCardTitle: {
    color: "#E5E5EA",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
  } satisfies TextStyle,

  heroCardSubtitle: {
    color: "#AEAEB2", // Texto secundário acinzentado, leitura confortável
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
  } satisfies TextStyle,

  primaryButton: {
    backgroundColor: "#E5E5EA", // Inversão em tom gelo fosco, sem o soco do branco puro #FFF
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  } satisfies ViewStyle,

  primaryButtonText: {
    color: "#1A1A1E", // Texto do botão usa o tom do card para harmonia cromática
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  } satisfies TextStyle,

  /* SEÇÕES E GRID */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  } satisfies ViewStyle,

  sectionTitle: {
    color: "#48484A", // Cinza escuro discreto para títulos de seção
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  } satisfies TextStyle,

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A1A1E",
  } satisfies ViewStyle,

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    gap: 12,
  } satisfies ViewStyle,

  featureCard: {
    backgroundColor: "#1A1A1E", // Mesma tonalidade do bloco superior, assentado no fundo escuro
    width: (width - 48) / 2,
    padding: 16,
    borderWidth: 1,
    borderColor: "#26262B",
    justifyContent: "space-between",
    minHeight: 165,
  } satisfies ViewStyle,

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  } satisfies ViewStyle,

  cardIndex: {
    color: "#3A3A3C",
    fontSize: 12,
    fontWeight: "700",
  } satisfies TextStyle,

  cardTitle: {
    color: "#E5E5EA",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
    marginBottom: 6,
  } satisfies TextStyle,

  cardDescription: {
    color: "#8E8E93",
    fontSize: 11,
    lineHeight: 15,
  } satisfies TextStyle,

  /* FOOTER */
  footerBanner: {
    marginHorizontal: 24,
    marginTop: 36,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1A1A1E",
  } satisfies ViewStyle,

  footerText: {
    color: "#3A3A3C",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  } satisfies TextStyle,
});
