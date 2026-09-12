import { Text, View } from 'react-native';

import { cn } from '@/lib/utils';

const SIZES = {
  sm: { box: 'h-8 w-8', text: 'text-[12px]' },
  md: { box: 'h-11 w-11', text: 'text-[15px]' },
  lg: { box: 'h-16 w-16', text: 'text-[20px]' },
} as const;

interface PersonAvatarProps {
  name: string;
  /** Full-strength background utility, e.g. `bg-berry`. */
  colorClass?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function PersonAvatar({
  name,
  colorClass = 'bg-accent-soft',
  size = 'md',
  className,
}: PersonAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full',
        SIZES[size].box,
        colorClass,
        className,
      )}
    >
      <Text className={cn('text-foreground font-semibold', SIZES[size].text)}>{initials}</Text>
    </View>
  );
}
