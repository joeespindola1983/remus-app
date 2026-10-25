import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { RemusIcon } from './RemusIcon';

type RemusLoadingIconProps = {
  color: string;
  size?: number;
};

/** Figma Icon/Loading: same SVG geometry on both platforms.
 * Rotation is removed when the system preference is Reduce Motion.
 */
export function RemusLoadingIcon({ color, size = 32 }: RemusLoadingIconProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => { if (mounted) { setReduceMotion(enabled); } })
      .catch(() => { if (mounted) { setReduceMotion(true); } });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      progress.stopAnimation();
      progress.setValue(0);
      return;
    }
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: true,
    }));
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(0);
    };
  }, [progress, reduceMotion]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <RemusIcon name="loading" size={size} strokeColor={color} />
    </Animated.View>
  );
}
