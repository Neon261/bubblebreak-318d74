import { PressableFeedback, Typography, useThemeColor } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  /** 1-based. */
  step: number;
  total: number;
  onBack?: () => void;
}

/** Back control plus step dots for the registration flow. */
export function OnboardingProgress({ step, total, onBack }: OnboardingProgressProps) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="h-9 flex-row items-center gap-3">
      {onBack ? (
        <PressableFeedback onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <View className="border-border h-9 w-9 items-center justify-center rounded-full border">
            <ChevronLeft color={foreground} size={18} />
          </View>
        </PressableFeedback>
      ) : null}

      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={cn(
              'h-1.5 rounded-full',
              index + 1 === step ? 'bg-accent w-6' : 'bg-default w-1.5',
            )}
          />
        ))}
      </View>

      <Typography type="body-xs" color="muted">
        Step {step} of {total}
      </Typography>
    </View>
  );
}
