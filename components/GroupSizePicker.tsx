import { Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { SPOT_OPTIONS } from '@/lib/pings';

interface GroupSizePickerProps {
  /** How many people can join besides me. */
  value: number;
  onChange: (count: number) => void;
  /** Can't go below the people who are already in. */
  min?: number;
  label?: string;
  hint?: string;
}

export function GroupSizePicker({
  value,
  onChange,
  min = 1,
  label = 'How many people can join?',
  hint,
}: GroupSizePickerProps) {
  return (
    <View className="gap-3">
      <Typography type="body-sm" weight="medium">
        {label}
      </Typography>
      <View className="flex-row flex-wrap gap-2">
        {SPOT_OPTIONS.map((count) => {
          const selected = count === value;
          const blocked = count < min;
          return (
            <Chip
              key={count}
              variant={selected ? 'primary' : 'tertiary'}
              color={selected ? 'accent' : 'default'}
              disabled={blocked}
              className={blocked ? 'opacity-40' : undefined}
              onPress={() => onChange(count)}
              accessibilityLabel={`Let ${count} ${count === 1 ? 'person' : 'people'} join`}
            >
              <Chip.Label>{count}</Chip.Label>
            </Chip>
          );
        })}
      </View>
      <Typography type="body-xs" color="muted">
        {hint ??
          `You plus up to ${value} ${value === 1 ? 'person' : 'people'}. First to say yes is in.`}
      </Typography>
    </View>
  );
}
