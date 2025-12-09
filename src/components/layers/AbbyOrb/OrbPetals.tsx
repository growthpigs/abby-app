/**
 * OrbPetals - Flowing petal shapes around Abby's core
 *
 * NEW APPROACH: Using Oval primitives with rotation transforms
 * instead of complex bezier paths. Simpler, more reliable rendering.
 *
 * Each petal is an elongated oval, positioned around the core,
 * rotating slowly in different directions.
 */

import React, { useEffect } from 'react';
import {
  Canvas,
  Oval,
  LinearGradient,
  vec,
  Group,
  Blur,
  rect,
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
import { OrbPetalsProps } from '../../../types/orb';
import { ORB_TIMING } from './constants';

interface PetalConfig {
  // Position angle around the orb (degrees)
  angle: number;
  // Distance from center (multiplier of radius)
  distance: number;
  // Petal dimensions (multipliers of radius)
  width: number;
  height: number;
  // Rotation speed and direction
  rotationSpeed: number;
  rotationDirection: 1 | -1;
  // Initial rotation offset
  initialRotation: number;
}

// Three petals arranged around the orb
const PETAL_CONFIGS: PetalConfig[] = [
  {
    angle: -90,        // Top
    distance: 0.3,
    width: 0.8,
    height: 1.8,
    rotationSpeed: 1,
    rotationDirection: 1,
    initialRotation: 0,
  },
  {
    angle: 150,        // Bottom left
    distance: 0.3,
    width: 0.75,
    height: 1.7,
    rotationSpeed: 0.8,
    rotationDirection: -1,
    initialRotation: 120,
  },
  {
    angle: 30,         // Bottom right
    distance: 0.3,
    width: 0.7,
    height: 1.6,
    rotationSpeed: 0.9,
    rotationDirection: 1,
    initialRotation: 240,
  },
];

interface PetalProps {
  cx: number;
  cy: number;
  radius: number;
  config: PetalConfig;
  rotation: SharedValue<number>;
  visible: SharedValue<number>;
  warmColor: string;
  coolColor: string;
}

const Petal: React.FC<PetalProps> = ({
  cx,
  cy,
  radius,
  config,
  rotation,
  visible,
  warmColor,
  coolColor,
}) => {
  const {
    angle,
    distance,
    width,
    height,
    rotationSpeed,
    rotationDirection,
    initialRotation,
  } = config;

  // Calculate petal center position
  const angleRad = (angle * Math.PI) / 180;
  const petalCx = cx + Math.cos(angleRad) * radius * distance;
  const petalCy = cy + Math.sin(angleRad) * radius * distance;

  // Petal dimensions
  const petalWidth = radius * width;
  const petalHeight = radius * height;

  // Create oval rect (centered on petal position)
  const ovalRect = rect(
    petalCx - petalWidth / 2,
    petalCy - petalHeight / 2,
    petalWidth,
    petalHeight
  );

  // Animated rotation
  const transform = useDerivedValue(() => {
    const baseRotation = (initialRotation * Math.PI) / 180;
    const animatedRotation = (rotation.value * rotationSpeed * rotationDirection * Math.PI) / 180;
    return [{ rotate: baseRotation + animatedRotation }];
  }, [rotation]);

  const opacity = useDerivedValue(() => visible.value * 0.6, [visible]);

  return (
    <Group
      transform={transform}
      origin={vec(cx, cy)}
      opacity={opacity}
    >
      <Oval rect={ovalRect}>
        <LinearGradient
          start={vec(petalCx, petalCy - petalHeight / 2)}
          end={vec(petalCx, petalCy + petalHeight / 2)}
          colors={[warmColor, coolColor]}
        />
        <Blur blur={8} />
      </Oval>
    </Group>
  );
};

export const OrbPetals: React.FC<OrbPetalsProps> = ({
  size,
  colors,
  visible,
}) => {
  const rotation = useSharedValue(0);
  const visibleValue = useSharedValue(visible ? 1 : 0);

  // Continuous rotation animation
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000, // 20 seconds per full rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  // Visibility animation
  useEffect(() => {
    visibleValue.value = withTiming(visible ? 1 : 0, {
      duration: ORB_TIMING.modeTransition,
      easing: Easing.out(Easing.ease),
    });
  }, [visible, visibleValue]);

  // Canvas needs extra space for petals extending beyond core
  const canvasSize = size * 2.5;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const radius = size / 2;

  return (
    <Canvas
      style={[
        styles.canvas,
        {
          width: canvasSize,
          height: canvasSize,
          marginLeft: -(canvasSize - size) / 2,
          marginTop: -(canvasSize - size) / 2,
        },
      ]}
    >
      {PETAL_CONFIGS.map((config, index) => (
        <Petal
          key={index}
          cx={cx}
          cy={cy}
          radius={radius}
          config={config}
          rotation={rotation}
          visible={visibleValue}
          warmColor={colors.petals.warm}
          coolColor={colors.petals.cool}
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

export default OrbPetals;
