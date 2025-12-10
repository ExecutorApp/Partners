import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions, ViewStyle, View } from 'react-native';

type Direction = 'forward' | 'backward';

interface SlideInViewProps {
  visible: boolean;
  direction: Direction;
  style?: ViewStyle | ViewStyle[] | any;
  children: React.ReactNode;
  animation?: 'none' | 'slide';
}

const SlideInView: React.FC<SlideInViewProps> = ({ visible, direction, style, children, animation = 'none' }) => {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || animation === 'none') return;
    const offset = Math.max(width - 30, 0);
    translateX.setValue(direction === 'forward' ? offset : -offset);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, direction, width, animation]);

  if (animation === 'slide') {
    return (
      <Animated.View style={[style, { transform: [{ translateX }] }]}> 
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={style}>
      {children}
    </View>
  );
};

export default SlideInView;
