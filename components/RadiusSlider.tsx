import { Slider, Typography } from 'heroui-native';
import { View } from 'react-native';

interface RadiusSliderProps {
  radiusKm: number;
  onChange: (km: number) => void;
  hint?: string;
}

export function RadiusSlider({ radiusKm, onChange, hint }: RadiusSliderProps) {
  const handleChange = (value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    onChange(Math.round(next));
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Typography type="body-sm" weight="medium">
          How far around you
        </Typography>
        <Typography type="body-sm" weight="semibold" className="text-accent">
          {radiusKm} km
        </Typography>
      </View>

      <Slider value={radiusKm} onChange={handleChange} minValue={1} maxValue={10} step={1}>
        <Slider.Track>
          <Slider.TrackBackground />
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      {hint ? (
        <Typography type="body-xs" color="muted">
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}
