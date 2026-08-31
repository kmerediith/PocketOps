import { useRef } from 'react';
import { Animated } from 'react-native';
import { Button } from 'react-native-paper';

// Big thumb target that springs inward on press and bounces back on release.
export const AcknowledgeButton = ({ onPress, style, label = 'ACKNOWLEDGE' }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 12,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Button
        mode="contained"
        icon="check-bold"
        onPress={onPress}
        onPressIn={() => spring(0.96)}
        onPressOut={() => spring(1)}
        contentStyle={{ paddingVertical: 10 }}
        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 }}
      >
        {label}
      </Button>
    </Animated.View>
  );
};
