import { Button, Typography } from 'heroui-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { BubbleField } from '@/components/BubbleField';
import { Heading } from '@/components/Heading';
import { BRAND } from '@/lib/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="relative items-center gap-3 overflow-hidden px-6 py-14">
      <BubbleField preset="soft" />
      <View className="bg-accent-soft h-20 w-20 items-center justify-center rounded-full">
        <Icon color={BRAND.accent} size={30} />
      </View>
      <Heading type="h5" align="center" className="mt-1">
        {title}
      </Heading>
      <Typography type="body-sm" color="muted" align="center" className="max-w-72">
        {body}
      </Typography>
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction} className="mt-3">
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
