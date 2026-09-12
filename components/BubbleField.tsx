import { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/ui/primitives/AnimatedView';
import { cn } from '@/lib/utils';

export type BubbleTint = 'apricot' | 'teal' | 'lilac';

export interface BubbleSpec {
  /** Diameter in px. */
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  tint?: BubbleTint;
  /** Outline only — reads as a bubble you could step out of. */
  hollow?: boolean;
  /** 0 hides it, 1 is the raw tint. Defaults to 1 for fills, 0.9 for outlines. */
  opacity?: number;
  /** Vertical travel in px. 0 (default) keeps the bubble still. */
  drift?: number;
  /** Seconds-ish: one leg of the drift loop, in ms. */
  duration?: number;
  delay?: number;
}

const FILL: Record<BubbleTint, string> = {
  apricot: 'bg-bubble-apricot',
  teal: 'bg-bubble-teal',
  lilac: 'bg-bubble-lilac',
};

const OUTLINE: Record<BubbleTint, string> = {
  apricot: 'border-bubble-apricot',
  teal: 'border-bubble-teal',
  lilac: 'border-bubble-lilac',
};

function Bubble({
  size,
  top,
  bottom,
  left,
  right,
  tint = 'apricot',
  hollow = false,
  opacity,
  drift = 0,
  duration = 4200,
  delay = 0,
}: BubbleSpec) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (drift === 0) return;
    // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is mutable by design; writing to `.value` is the documented API for worklet-driven animations.
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [delay, drift, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -drift * progress.value }],
  }));

  return (
    <AnimatedView
      className={cn('absolute rounded-full', hollow ? cn('border-2', OUTLINE[tint]) : FILL[tint])}
      style={[
        {
          width: size,
          height: size,
          top,
          bottom,
          left,
          right,
          opacity: opacity ?? (hollow ? 0.9 : 1),
        },
        animatedStyle,
      ]}
    />
  );
}

const PRESETS = {
  /** Big soft shapes behind a hero block. */
  hero: [
    { size: 190, top: -70, right: -60, tint: 'apricot', drift: 10, duration: 5200 },
    { size: 108, top: 96, left: -44, tint: 'teal', drift: 8, duration: 4400, delay: 400 },
    {
      size: 54,
      top: 24,
      left: 74,
      tint: 'lilac',
      hollow: true,
      drift: 12,
      duration: 3800,
      delay: 900,
    },
    { size: 22, top: 132, right: 52, tint: 'apricot', drift: 14, duration: 3200, delay: 200 },
  ] as BubbleSpec[],
  /** A light touch behind a screen title. */
  header: [
    { size: 128, top: -58, right: -34, tint: 'apricot', opacity: 0.85 },
    { size: 40, top: 34, right: 96, tint: 'teal', hollow: true, opacity: 0.7 },
    { size: 14, top: 12, right: 142, tint: 'lilac' },
  ] as BubbleSpec[],
  /** Scattered small bubbles for empty states and cards. */
  soft: [
    { size: 84, bottom: -30, left: -24, tint: 'teal', opacity: 0.7 },
    { size: 46, top: 18, right: 22, tint: 'apricot', opacity: 0.75 },
    { size: 18, bottom: 34, right: 62, tint: 'lilac', hollow: true },
  ] as BubbleSpec[],
  /** A rising trail — the "break out" moment. */
  rise: [
    { size: 96, bottom: -34, right: -22, tint: 'apricot', drift: 10, duration: 4600 },
    { size: 42, bottom: 46, right: 62, tint: 'teal', drift: 16, duration: 3600, delay: 300 },
    { size: 20, bottom: 96, right: 34, tint: 'lilac', drift: 22, duration: 3000, delay: 700 },
    { size: 10, bottom: 132, right: 74, tint: 'apricot', drift: 26, duration: 2600, delay: 1100 },
  ] as BubbleSpec[],
} satisfies Record<string, BubbleSpec[]>;

export type BubblePreset = keyof typeof PRESETS;

interface BubbleFieldProps {
  preset?: BubblePreset;
  /** Overrides the preset when given. */
  bubbles?: BubbleSpec[];
  /** Set false to freeze the drift (long lists, reduced motion). */
  animate?: boolean;
  className?: string;
}

/**
 * Decorative bubbles behind content. Absolutely positioned and never
 * interactive: drop it as the first child of a `relative overflow-hidden` box.
 */
export function BubbleField({
  preset = 'soft',
  bubbles,
  animate = true,
  className,
}: BubbleFieldProps) {
  const specs = bubbles ?? PRESETS[preset];

  return (
    <View pointerEvents="none" className={cn('absolute inset-0 overflow-hidden', className)}>
      {specs.map((spec) => (
        <Bubble
          key={`${spec.size}-${spec.top ?? 'x'}-${spec.bottom ?? 'x'}-${spec.left ?? 'x'}-${spec.right ?? 'x'}-${spec.tint ?? 'x'}`}
          {...spec}
          drift={animate ? spec.drift : 0}
        />
      ))}
    </View>
  );
}
