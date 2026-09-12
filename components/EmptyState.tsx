import { Button, Typography, useThemeColor } from 'heroui-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const [accent] = useThemeColor(['accent']);

  return (
    <View className="items-center gap-3 px-6 py-12">
      <View className="bg-accent-soft h-16 w-16 items-center justify-center rounded-full">
        <Icon color={accent} size={28} />
      </View>
      <Typography type="h5" align="center">
        {title}
      </Typography>
      <Typography type="body-sm" color="muted" align="center">
        {body}
      </Typography>
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction} className="mt-2">
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
