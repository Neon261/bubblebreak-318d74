import { Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { READY_OPTIONS } from '@/lib/geo';
import type { ReadyMinutes } from '@/lib/types';

interface ReadyPickerProps {
  value: ReadyMinutes;
  onChange: (minutes: ReadyMinutes) => void;
  label?: string;
  hint?: string;
}

export function ReadyPicker({
  value,
  onChange,
  label = 'How long do you need to get ready?',
  hint,
}: ReadyPickerProps) {
  return (
    <View className="gap-3">
      <Typography type="body-sm" weight="medium">
        {label}
      </Typography>
      <View className="flex-row flex-wrap gap-2">
        {READY_OPTIONS.map((minutes) => {
          const selected = minutes === value;
          return (
            <Chip
              key={minutes}
              variant={selected ? 'primary' : 'tertiary'}
              color={selected ? 'accent' : 'default'}
              onPress={() => onChange(minutes)}
            >
              <Chip.Label>{minutes} min</Chip.Label>
            </Chip>
          );
        })}
      </View>
      {hint ? (
        <Typography type="body-xs" color="muted">
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}
