import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GridBackground
 *
 * Pigify cyber grid mesh + ambient radial glows.
 * Matches the web AuthPro.css (.pigify-grid-mesh) exactly.
 * Adapts dynamically to light and dark theme mode.
 */
function GridBackground({ gridSize = 64, style }) {
  const { colors, isDark } = useTheme();
  const W = SCREEN_WIDTH;
  const H = SCREEN_HEIGHT;

  const vCount = useMemo(() => Math.ceil(W / gridSize) + 1, [W, gridSize]);
  const hCount = useMemo(() => Math.ceil(H / gridSize) + 1, [H, gridSize]);

  const lineColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.05)';

  const vLines = useMemo(
    () =>
      Array.from({ length: vCount }).map((_, i) => (
        <View key={`v${i}`} style={[styles.vLine, { left: i * gridSize, backgroundColor: lineColor }]} />
      )),
    [vCount, gridSize, lineColor]
  );

  const hLines = useMemo(
    () =>
      Array.from({ length: hCount }).map((_, i) => (
        <View key={`h${i}`} style={[styles.hLine, { top: i * gridSize, backgroundColor: lineColor }]} />
      )),
    [hCount, gridSize, lineColor]
  );

  return (
    <View
      style={[styles.root, { backgroundColor: colors.bgDeep }, style]}
      renderToHardwareTextureAndroid={true}
      shouldRasterizeIOS={true}
    >
      {/* ── Vertical grid lines ── */}
      {vLines}

      {/* ── Horizontal grid lines ── */}
      {hLines}

      {/* ── Ambient radial glow blobs ── */}
      <View
        style={[
          styles.glowTopLeft,
          { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.22)' : 'rgba(225, 29, 72, 0.08)' },
        ]}
      />
      <View
        style={[
          styles.glowTopRight,
          { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.06)' },
        ]}
      />
      <View
        style={[
          styles.glowBottomCenter,
          { backgroundColor: isDark ? 'rgba(6, 182, 212, 0.14)' : 'rgba(8, 145, 178, 0.05)' },
        ]}
      />
    </View>
  );
}

export default React.memo(GridBackground);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    height: SCREEN_HEIGHT,
    width: 1,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    width: SCREEN_WIDTH,
    height: 1,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  glowTopRight: {
    position: 'absolute',
    top: 20,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  glowBottomCenter: {
    position: 'absolute',
    bottom: -80,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
  },
});
