import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GridBackground
 * 
 * High-tech cyber grid mesh + ambient multi-radial glows.
 * Matches 1:1 with web Pigify AuthPro.css (.pigify-grid-mesh & .pigify-ambient-overlay)
 * and Home.css (.pigify-home-mesh & .pigify-home-ambient-glow).
 */
function GridBackground({
  gridSize = 38,
  lineColor = 'rgba(255, 255, 255, 0.048)',
  showGlows = true,
  children,
  style,
}) {
  const effectiveWidth = Math.max(SCREEN_WIDTH, 600);
  const effectiveHeight = Math.max(SCREEN_HEIGHT, 1400);

  const numVLines = useMemo(() => Math.ceil(effectiveWidth / gridSize) + 1, [effectiveWidth, gridSize]);
  const numHLines = useMemo(() => Math.ceil(effectiveHeight / gridSize) + 1, [effectiveHeight, gridSize]);

  const vLines = useMemo(() => Array.from({ length: numVLines }), [numVLines]);
  const hLines = useMemo(() => Array.from({ length: numHLines }), [numHLines]);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* ── Ambient Radial Glows (Web 1:1 Color Tokens) ── */}
      {showGlows && (
        <>
          <View style={styles.glowTopLeft} />
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomCenter} />
        </>
      )}

      {/* ── Cyber Grid Mesh Lines ── */}
      <View style={styles.gridContainer}>
        {/* Vertical lines */}
        {vLines.map((_, i) => (
          <View
            key={`vl-${i}`}
            style={[
              styles.vLine,
              {
                left: i * gridSize,
                backgroundColor: lineColor,
              },
            ]}
          />
        ))}

        {/* Horizontal lines */}
        {hLines.map((_, i) => (
          <View
            key={`hl-${i}`}
            style={[
              styles.hLine,
              {
                top: i * gridSize,
                backgroundColor: lineColor,
              },
            ]}
          />
        ))}
      </View>

      {/* ── Vignette / Gradient Overlay ── */}
      <LinearGradient
        colors={['rgba(7, 10, 19, 0.1)', 'rgba(7, 10, 19, 0.5)', '#070A13']}
        style={StyleSheet.absoluteFillObject}
      />

      {children}
    </View>
  );
}

export default React.memo(GridBackground);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070A13',
    overflow: 'hidden',
    zIndex: 0,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
  },
  glowTopRight: {
    position: 'absolute',
    top: 40,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  glowBottomCenter: {
    position: 'absolute',
    bottom: -80,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(6, 182, 212, 0.10)',
  },
});
