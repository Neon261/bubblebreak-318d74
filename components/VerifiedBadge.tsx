import { Typography } from 'heroui-native';
import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { BRAND } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  /** Omit for the icon-only pill. */
  label?: string;
  className?: string;
}

/**
 * Everyone in the app passed the outside identity check, so this badge is what
 * tells a stranger the person on the other side is real.
 */
export function VerifiedBadge({ label, className }: VerifiedBadgeProps) {
  return (
    <View
      className={cn(
        'bg-success-soft flex-row items-center gap-1 rounded-full px-2 py-0.5',
        className,
      )}
      accessibilityLabel={label ?? 'Identity verified'}
    >
      <ShieldCheck color={BRAND.success} size={12} />
      {label ? (
        <Typography type="body-xs" className="text-success-soft-foreground">
          {label}
        </Typography>
      ) : null}
    </View>
  );
}
