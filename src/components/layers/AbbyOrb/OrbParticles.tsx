/**
 * OrbParticles - Floating dots around Abby's orb
 *
 * Small glowing particles that drift slowly around the orb,
 * adding depth and a magical quality.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Canvas,
  Circle,
  Blur,
  Group,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { OrbParticlesProps } from '../../../types/orb';
import { ORB_TIMING } from './constants';

// Generate particle positions
const generateParticles = (count: number) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 1.1 + Math.random() * 0.5; // 1.1 to 1.6 radius
    particles.push({
      id: i,
      angle,
      distance,
      size: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.4,
      driftSpeed: 0.5 + Math.random() * 0.5,
    });
  }
  return particles;
};

const PARTICLES = generateParticles(15);

interface ParticleProps {
  cx: number;
  cy: number;
  radius: number;
  particle: typeof PARTICLES[0];
  time: SharedValue<number>;
  visible: SharedValue<number>;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({
  cx,
  cy,
  radius,
  particle,
  time,
  visible,
  color,
}) => {
  const position = useDerivedValue(() => {
    // Slow drift based on time
    const drift = time.value * 0.0001 * particle.driftSpeed;
    const angle = particle.angle + drift;
    const r = radius * particle.distance;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  }, [time]);

  const opacity = useDerivedValue(
    () => particle.opacity * visible.value,
    [visible]
  );

  const x = useDerivedValue(() => position.value.x, [position]);
  const y = useDerivedValue(() => position.value.y, [position]);

  return (
    <Group opacity={opacity}>
      <Circle cx={x} cy={y} r={particle.size} color={color}>
        <Blur blur={2} />
      </Circle>
    </Group>
  );
};

export const OrbParticles: React.FC<OrbParticlesProps> = ({
  orbSize,
  color,
  visible,
}) => {
  const time = useSharedValue(0);
  const visibleValue = useSharedValue(visible ? 1 : 0);

  // Time animation for drift
  useEffect(() => {
    time.value = withRepeat(
      withTiming(100000, {
        duration: 100000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [time]);

  // Visibility animation
  useEffect(() => {
    visibleValue.value = withTiming(visible ? 1 : 0, {
      duration: ORB_TIMING.modeTransition,
      easing: Easing.out(Easing.ease),
    });
  }, [visible, visibleValue]);

  // Canvas needs to be larger to contain particles
  const canvasSize = orbSize * 2;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const radius = orbSize / 2;

  return (
    <Canvas
      style={[
        styles.canvas,
        {
          width: canvasSize,
          height: canvasSize,
          marginLeft: -orbSize / 2,
          marginTop: -orbSize / 2,
        },
      ]}
    >
      {PARTICLES.map((particle) => (
        <Particle
          key={particle.id}
          cx={cx}
          cy={cy}
          radius={radius}
          particle={particle}
          time={time}
          visible={visibleValue}
          color={color}
        />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
});

export default OrbParticles;
