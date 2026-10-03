import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GridBackground
 *
 * Pigify cyber grid mesh + ambient radial glows.
 * Matches the web AuthPro.css (.pigify-grid-mesh) exactly.
 *
 * IMPORTANT: The parent screen must set ScrollView and KeyboardAvoidingView
 * to backgroundColor: 'transparent' for this to show through.
 */
function GridBackground({ gridSize = 40, style }) {
  const W = SCREEN_WIDTH;
  const H = SCREEN_HEIGHT * 2.5; // tall enough to cover scroll

  const vCount = useMemo(() => Math.ceil(W / gridSize) + 2, [W, gridSize]);
  const hCount = useMemo(() => Math.ceil(H / gridSize) + 2, [H, gridSize]);

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      {/* Dark base */}
      <View style={StyleSheet.absoluteFillObject} />

      {/* ── Vertical grid lines ── */}
      {Array.from({ length: vCount }).map((_, i) => (
        <View key={`v${i}`} style={[styles.vLine, { left: i * gridSize }]} />
      ))}

      {/* ── Horizontal grid lines ── */}
      {Array.from({ length: hCount }).map((_, i) => (
        <View key={`h${i}`} style={[styles.hLine, { top: i * gridSize }]} />
      ))}

      {/* ── Ambient radial glow blobs ── */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomCenter} />
    </View>
  );
}

export default React.memo(GridBackground);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070A13',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    height: SCREEN_HEIGHT * 2.5,
    width: 1,
    // Bright enough to see on any device — web equivalent is 0.03 but
    // native 1dp views need 0.16+ to be visible on dark backgrounds
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    width: SCREEN_WIDTH,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(244, 63, 94, 0.22)',
  },
  glowTopRight: {
    position: 'absolute',
    top: 20,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  glowBottomCenter: {
    position: 'absolute',
    bottom: -80,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
  },
});
