import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { appTheme } from '@/shared/constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text
            style={{
              color: appTheme.colors.white,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Algo deu errado
          </Text>
          <Text
            style={{
              color: appTheme.colors.textSecondary,
              fontSize: 14,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            O app encontrou um erro inesperado.
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{
              backgroundColor: appTheme.colors.textPrimary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: appTheme.colors.white, fontWeight: '700' }}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
