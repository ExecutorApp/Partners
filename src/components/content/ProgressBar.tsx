import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  progress: number; // 0..1
  onSeek?: (fraction: number) => void;
  trackColor?: string;
  fillColor?: string;
  dotColor?: string;
  style?: any;
};

const ProgressBar: React.FC<Props> = ({
  progress,
  onSeek,
  trackColor = '#9FCAFF',
  fillColor = '#1777CF',
  dotColor = '#1777CF',
  style,
}) => {
  const [width, setWidth] = React.useState(0);
  const safeProgress = Math.max(0, Math.min(1, isFinite(progress) ? progress : 0));
  const fillWidth = Math.round(width * safeProgress);
  const DEBUG = true;

  React.useEffect(() => {
    if (DEBUG) {
      console.log('[ProgressBar] render', { width, progress: safeProgress, fillWidth });
    }
  }, [width, safeProgress, fillWidth]);

  const handleSeek = (x: number) => {
    if (!onSeek || width <= 0) return;
    const fraction = Math.max(0, Math.min(1, x / width));
    onSeek(fraction);
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handleSeek(e.nativeEvent.locationX)}
      onResponderMove={(e) => handleSeek(e.nativeEvent.locationX)}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]} />
      <View style={[styles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
      <View style={[styles.dot, { left: Math.max(0, fillWidth - 4), backgroundColor: dotColor }]} />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    height: 8,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    left: 0,
    top: 3,
    right: 0,
    height: 3,
    borderRadius: 4,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 3,
    height: 3,
    borderRadius: 4,
  },
  dot: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});