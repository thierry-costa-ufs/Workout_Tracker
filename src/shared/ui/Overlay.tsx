import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appTheme } from '@/shared/constants/theme';

interface OverlayProps {
  visible: boolean;
  onClose?: () => void;
  animationType?: 'fade' | 'slide';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Overlay({
  visible,
  onClose,
  animationType = 'fade',
  children,
  style,
}: OverlayProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const isRendered = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      onCloseRef.current?.();
      return true;
    });

    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      setKeyboardHeight(0);
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      isRendered.current = true;
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        ...(animationType === 'slide'
          ? [
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 18,
                stiffness: 200,
              }),
            ]
          : []),
      ]).start();
    } else {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...(animationType === 'slide'
          ? [
              Animated.timing(translateY, {
                toValue: Dimensions.get('window').height,
                duration: 200,
                useNativeDriver: true,
              }),
            ]
          : []),
      ]).start(() => {
        isRendered.current = false;
      });
    }
  }, [visible, animationType, opacity, translateY]);

  if (!visible && !isRendered.current) return null;

  const bottomPad = insets.bottom + tabBarHeight + 16;

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { paddingBottom: bottomPad, marginBottom: keyboardHeight },
            animationType === 'slide' ? { transform: [{ translateY }] } : { opacity },
          ]}
        >
          <View style={[styles.sheet, style]}>{children}</View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  sheet: {
    width: '100%',
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
});
