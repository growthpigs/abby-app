/**
 * FPS Monitor for GPU Performance Testing
 *
 * Displays real-time FPS and frame time stats.
 * Use to measure shader performance impact.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FPSStats {
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
}

export function FPSMonitor() {
  const [stats, setStats] = useState<FPSStats>({
    fps: 0,
    avgFps: 0,
    minFps: 999,
    maxFps: 0,
    frameTime: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const rafIdRef = useRef<number>();

  useEffect(() => {
    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      frameCountRef.current++;

      // Update every 500ms for readable display
      if (delta >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        const frameTime = delta / frameCountRef.current;

        // Track history for avg/min/max (last 20 samples)
        fpsHistoryRef.current.push(currentFps);
        if (fpsHistoryRef.current.length > 20) {
          fpsHistoryRef.current.shift();
        }

        const history = fpsHistoryRef.current;
        const avgFps = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
        const minFps = Math.min(...history);
        const maxFps = Math.max(...history);

        setStats({
          fps: currentFps,
          avgFps,
          minFps,
          maxFps,
          frameTime: Math.round(frameTime * 100) / 100,
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return '#10B981'; // Green - good
    if (fps >= 45) return '#F59E0B'; // Orange - warning
    return '#EF4444'; // Red - bad
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.fps, { color: getFpsColor(stats.fps) }]}>
          {stats.fps}
        </Text>
        <Text style={styles.label}>FPS</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>avg: {stats.avgFps}</Text>
        <Text style={styles.detail}>min: {stats.minFps}</Text>
        <Text style={styles.detail}>max: {stats.maxFps}</Text>
        <Text style={styles.detail}>{stats.frameTime}ms</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 8,
    minWidth: 70,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fps: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    marginTop: 4,
    gap: 1,
  },
  detail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontVariant: ['tabular-nums'],
  },
});
