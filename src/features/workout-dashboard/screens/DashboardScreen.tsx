import { AppScreen } from '@/core/ui/AppScreen';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { useActiveTemplate } from '@/shared/hooks/useActiveTemplate';
import { useSwitchTab } from '@/shared/context/TabNavigationContext';
import { SidebarDrawer } from '@/shared/ui/SidebarDrawer';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { dashboardStyles as styles } from '../styles/dashboardStyles';

function getActiveRoute(pathname: string): string {
  if (pathname === '/record') return '/record';
  if (pathname === '/(tabs)' || pathname === '/(tabs)/') return '/(tabs)';
  if (pathname.startsWith('/(tabs)/')) return pathname;
  return '/(tabs)';
}

export default function DashboardScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const switchTab = useSwitchTab();
  const currentTemplate = useActiveTemplate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const openSidebar = useCallback(() => setSidebarVisible(true), []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);

  const currentRoute = getActiveRoute(pathname);

  const handleSidebarNavigate = (route: string) => {
    const tabMap: Record<string, number> = {
      '/(tabs)': 0,
      '/(tabs)/session': 1,
      '/(tabs)/timer': 2,
      '/(tabs)/planning': 3,
    };
    const idx = tabMap[route];
    if (idx !== undefined) {
      switchTab(idx);
    } else if (route === '/record') {
      router.push('/record' as never);
    }
  };

  return (
    <AppScreen style={sharedScreenStyles.container} backgroundColor={appTheme.colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={sharedScreenStyles.pageHeader}>
          <View style={sharedScreenStyles.pageTitleBlock}>
            <Text style={sharedScreenStyles.pageTitle}>
              <Feather name="activity" size={32} color={appTheme.colors.textPrimary} />
              PRÁXIS
            </Text>
            <Text style={sharedScreenStyles.pageSubtitle}>DESAFIE A SUA NATUREZA</Text>
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
            <Feather name="menu" size={22} color={appTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View
          style={[sharedScreenStyles.cardSurface, sharedScreenStyles.heroCard, styles.mainHeroCard]}
        >
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroTag}>DIVISÃO DE TREINO ATUAL</Text>
          </View>

          <Text style={styles.heroCardTitle}>
            {currentTemplate ? currentTemplate.name.toUpperCase() : 'FAÇA SUA ROTINA'}
          </Text>
          <Text style={styles.heroCardSubtitle}>
            Monitore o volume total e atual da sessão. Dessa maneira, você tem maior domínio sobre o
            que foi e que está sendo feito.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => switchTab(1)}
          >
            <Text style={styles.primaryButtonText}>INICIAR SESSÃO</Text>
            <Feather name="arrow-right" size={16} color={appTheme.colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={sharedScreenStyles.sectionHeaderContainer}>
          <Text style={sharedScreenStyles.sectionTitleText}>FERRAMENTAS DE TREINO</Text>
          <View style={sharedScreenStyles.sectionDivider} />
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => switchTab(3)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>01</Text>
              <Feather name="sliders" size={16} color={appTheme.colors.textPrimary} />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>MONTE A SUA DIVISÃO DE TREINO</Text>
              <Text style={styles.cardDescription}>
                Decida qual será o volume diário e semanal do treino a partir de um cronograma
                personalizado.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => router.push('/record' as never)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>02</Text>
              <Feather name="bar-chart-2" size={16} color={appTheme.colors.textPrimary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>RECORDES PESSOAIS</Text>
              <Text style={styles.cardDescription}>
                Histórico de cargas alcançadas por quantidade de repetições a fim de visualizar
                progressão e limites.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => switchTab(2)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>03</Text>
              <Feather name="clock" size={16} color={appTheme.colors.textPrimary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>CRONOMETRE O SEU DESCANSO</Text>
              <Text style={styles.cardDescription}>
                Controle rígido de intervalos para uma maior noção de recuperação e tempo gasto.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBanner}>
          <Text style={styles.footerText}>CONSISTÊNCIA // ATÉ A FALHA</Text>
        </View>
      </ScrollView>

      <SidebarDrawer
        visible={sidebarVisible}
        onClose={closeSidebar}
        onNavigate={handleSidebarNavigate}
        currentRoute={currentRoute}
      />
    </AppScreen>
  );
}
