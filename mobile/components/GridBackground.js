import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GridBackground
 *
 * Renders the Pigify cyber grid mesh lines + ambient radial glows,
 * matching the web AuthPro.css (.pigify-grid-mesh) and Home.css (.pigify-home-mesh).
 *
 * Render order (back → front):
 *   1. Dark base fill (#070A13)
 *   2. Grid lines  (rendered FIRST so glows tint them)
 *   3. Ambient radial glow blobs (rose / emerald / cyan)
 */
function GridBackground({ gridSize = 38, showGlows = true, style }) {
  // Cover the full screen plus a small bleed so no gap appears on scroll
  const W = SCREEN_WIDTH + gridSize;
  const H = SCREEN_HEIGHT + gridSize * 2;

  const vLines = useMemo(
    () => Array.from({ length: Math.ceil(W / gridSize) + 1 }),
    [W, gridSize]
  );
  const hLines = useMemo(
    () => Array.from({ length: Math.ceil(H / gridSize) + 1 }),
    [H, gridSize]
  );

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      {/* ── 1. Grid lines (rendered below glows) ── */}
      {/* Vertical lines */}
      {vLines.map((_, i) => (
        <View
          key={`v${i}`}
          style={[styles.vLine, { left: i * gridSize }]}
        />
      ))}

      {/* Horizontal lines */}
      {hLines.map((_, i) => (
        <View
          key={`h${i}`}
          style={[styles.hLine, { top: i * gridSize }]}
        />
      ))}

      {/* ── 2. Ambient glow blobs (rendered ON TOP of lines, tinting them) ── */}
      {showGlows && (
        <>
          <View style={styles.glowTopLeft} />
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomCenter} />
        </>
      )}
    </View>
  );
}

export default React.memo(GridBackground);

const LINE_COLOR = 'rgba(255, 255, 255, 0.09)';

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070A13',
    overflow: 'hidden',
    zIndex: 0,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: LINE_COLOR,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: LINE_COLOR,
  },
  // ── Glow blobs — exact web color tokens ──
  glowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(244, 63, 94, 0.20)',
  },
  glowTopRight: {
    position: 'absolute',
    top: 20,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  glowBottomCenter: {
    position: 'absolute',
    bottom: -100,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
});
