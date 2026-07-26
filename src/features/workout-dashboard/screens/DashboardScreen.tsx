import { useTemplates } from "@/context/WorkoutContext";
import { AppScreen } from "@/core/ui/AppScreen";
import { appTheme } from "@/shared/constants/theme";
import { sharedScreenStyles } from "@/shared/styles/screenStyles";
import { useTabBackHandler } from "@/shared/hooks/useTabBackHandler";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dashboardStyles as styles } from "../styles/dashboardStyles";

export default function DashboardScreen() {
  useTabBackHandler();
  const router = useRouter();
  const { activeId, templates } = useTemplates();

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
              <Text style={styles.cardIndex}>04</Text>
              <Feather
                name="book-open"
                size={16}
                color={appTheme.colors.textPrimary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>---</Text>
              <Text style={styles.cardDescription}>---</Text>
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
