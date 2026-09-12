import { PressableFeedback, Typography } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { BRAND } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  /** 1-based. */
  step: number;
  total: number;
  onBack?: () => void;
}

/** Back control plus step dots for the registration flow. */
export function OnboardingProgress({ step, total, onBack }: OnboardingProgressProps) {
  return (
    <View className="h-9 flex-row items-center gap-3">
      {onBack ? (
        <PressableFeedback onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <View className="border-border h-9 w-9 items-center justify-center rounded-full border">
            <ChevronLeft color={BRAND.ink} size={18} />
          </View>
        </PressableFeedback>
      ) : null}

      <View className="flex-1 flex-row items-center gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index + 1 <= step ? 'bg-accent' : 'bg-default',
            )}
          />
        ))}
      </View>

      <Typography type="body-xs" color="muted" className="shrink-0">
        {step} of {total}
      </Typography>
    </View>
  );
}
