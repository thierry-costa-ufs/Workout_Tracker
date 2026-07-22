import { useWorkouts } from "@/context/WorkoutContext";
import { appTheme } from "@/shared/constants/theme";
import { sharedScreenStyles } from "@/shared/styles/screenStyles";
import { AppScreen } from "@/shared/ui/AppScreen";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
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

  const currentTemplate = templates.find(
    (template) => template.id === activeId,
  );

  const handleNavigation = (route: string) => {
    try {
      router.push(route as never);
    } catch {
      console.log(`Rota ${route} não encontrada.`);
    }
  };

  return (
    <AppScreen
      style={sharedScreenStyles.container}
      backgroundColor={appTheme.colors.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={sharedScreenStyles.pageHeader}>
          <View style={sharedScreenStyles.pageTitleBlock}>
            <Text style={sharedScreenStyles.pageTitle}>
              <Feather
                name="activity"
                size={32}
                color={appTheme.colors.textPrimary}
              />
              PRÁXIS
            </Text>
            <Text style={sharedScreenStyles.pageSubtitle}>
              DESAFIE A SUA NATUREZA
            </Text>
          </View>
        </View>

        <View
          style={[
            sharedScreenStyles.cardSurface,
            sharedScreenStyles.heroCard,
            styles.mainHeroCard,
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroTag}>DIVISÃO DE TREINO ATUAL</Text>
          </View>

          <Text style={styles.heroCardTitle}>
            {currentTemplate
              ? currentTemplate.name.toUpperCase()
              : "FAÇA SUA ROTINA"}
          </Text>
          <Text style={styles.heroCardSubtitle}>
            Monitore o volume total e atual da sessão. Dessa maneira, você tem
            maior domínio sobre o que foi e que está sendo feito.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => handleNavigation("/session")}
          >
            <Text style={styles.primaryButtonText}>INICIAR SESSÃO</Text>
            <Feather
              name="arrow-right"
              size={16}
              color={appTheme.colors.textInverse}
            />
          </TouchableOpacity>
        </View>

        <View style={sharedScreenStyles.sectionHeaderContainer}>
          <Text style={sharedScreenStyles.sectionTitleText}>
            FERRAMENTAS DE TREINO
          </Text>
          <View style={sharedScreenStyles.sectionDivider} />
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => handleNavigation("/planning")}
          >
            <View style={styles.cardHeader}>
              <Image
                source={require("@/assets/images/card1.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="center"
              />
              <Text style={styles.cardIndex}>01</Text>
              <Feather
                name="sliders"
                size={16}
                color={appTheme.colors.textPrimary}
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                MONTE A SUA DIVISÃO DE TREINO
              </Text>
              <Text style={styles.cardDescription}>
                Decida qual será o volume diário e semanal do treino a partir de
                um cronograma personalizado.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => handleNavigation("/record")}
          >
            <View style={styles.cardHeader}>
              <Image
                source={require("@/assets/images/card2.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="center"
              />
              <Text style={styles.cardIndex}>02</Text>
              <Feather
                name="bar-chart-2"
                size={16}
                color={appTheme.colors.textPrimary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>RECORDES PESSOAIS</Text>
              <Text style={styles.cardDescription}>
                Histórico de cargas alcançadas por quantidade de repetições a
                fim de visualizar progressão e limites.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => handleNavigation("/timer")}
          >
            <View style={styles.cardHeader}>
              <Image
                source={require("@/assets/images/card3.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="center"
              />
              <Text style={styles.cardIndex}>03</Text>
              <Feather
                name="clock"
                size={16}
                color={appTheme.colors.textPrimary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>CRONOMETRE O SEU DESCANSO</Text>
              <Text style={styles.cardDescription}>
                Controle rígido de intervalos para uma maior noção de
                recuperação e tempo gasto.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => handleNavigation("/exercises")}
          >
            <View style={styles.cardHeader}>
              <Image
                source={require("@/assets/images/card4.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="center"
              />
              <Text style={styles.cardIndex}>04</Text>
              <Feather
                name="book-open"
                size={16}
                color={appTheme.colors.textPrimary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>WIP</Text>
              <Text style={styles.cardDescription}>Lorem ipsum.</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBanner}>
          <Text style={styles.footerText}>CONSISTÊNCIA // ATÉ A FALHA</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  } satisfies ViewStyle,
  header: {
    paddingTop: 28,
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
  } satisfies ViewStyle,
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 12,
  } satisfies ViewStyle,
  featureCard: {
    width: (width - 24 * 2 - 12) / 2,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  } satisfies ViewStyle,
  cardHeader: {
    position: "relative",
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
  } satisfies ViewStyle,
  cardBody: {
    paddingTop: 8,
    padding: 12,
    height: 148,
  } satisfies ViewStyle,
  cardIndex: {
    color: appTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: "800",
  } satisfies TextStyle,
  cardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
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
