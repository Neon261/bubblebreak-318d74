import { Typography } from 'heroui-native';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

type TypographyProps = ComponentProps<typeof Typography>;

/**
 * Headings in the display face (Fraunces). Use for screen titles, card titles
 * and any line that should carry the brand voice; body copy stays on Inter.
 */
export function Heading({ className, type = 'h4', ...rest }: TypographyProps) {
  return <Typography type={type} className={cn('font-display', className)} {...rest} />;
}

const WORDMARK_SIZE = {
  sm: { text: 'text-lg', dot: 'h-2 w-2', ring: 'h-3 w-3 border' },
  md: { text: 'text-2xl', dot: 'h-2.5 w-2.5', ring: 'h-4 w-4 border-2' },
  lg: { text: 'text-4xl', dot: 'h-3 w-3', ring: 'h-5 w-5 border-2' },
} as const;

interface WordmarkProps {
  size?: keyof typeof WORDMARK_SIZE;
  className?: string;
}

/** "BubbleBreak" with a small bubble escaping upward from the word. */
export function Wordmark({ size = 'md', className }: WordmarkProps) {
  const s = WORDMARK_SIZE[size];

  return (
    <View className={cn('flex-row items-end gap-1.5', className)}>
      <Typography className={cn('font-display leading-tight', s.text)}>
        Bubble
        <Typography className={cn('font-display text-accent leading-tight', s.text)}>
          Break
        </Typography>
      </Typography>
      <View className="mb-1.5 flex-col items-center gap-0.5">
        <View className={cn('bg-accent rounded-full', s.dot)} />
        <View className={cn('border-accent/50 rounded-full', s.ring)} />
      </View>
    </View>
  );
}
