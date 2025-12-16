import FilterModal from "@/components/ui/FilterModal";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { currencyDollar } from "@/utils/moneyFormat";
import Slider from "@react-native-community/slider";
import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (min: number | null, max: number | null) => void;
  initialMin?: number | null;
  initialMax?: number | null;
  maxMonto?: number | null;
}

export default function MountRangeModal({
  visible,
  onClose,
  onApply,
  initialMin = 0,
  initialMax = null,
  maxMonto = 30000,
}: Props) {
  const { isDark } = useThemeStore();
  const safeMaxMonto = maxMonto ?? 30000;

  // Final state , in final slide
  const [min, setMin] = useState(initialMin ?? 0);
  const [max, setMax] = useState(initialMax ?? safeMaxMonto);

  // Show preview
  const [dragMin, setDragMin] = useState(min);
  const [dragMax, setDragMax] = useState(max);

  // refs without  re-renders
  const minRef = useRef(min);
  const maxRef = useRef(max);

  useEffect(() => {
    const newMin = initialMin ?? 0;
    const newMax = initialMax ?? safeMaxMonto;
    setMin(newMin);
    setMax(newMax);
    setDragMin(newMin);
    setDragMax(newMax);
    minRef.current = newMin;
    maxRef.current = newMax;
  }, [initialMin, initialMax, visible]);

  const sliderColors = useMemo(
    () => ({
      minTrack: isDark
        ? appTheme.dark.primary.DEFAULT
        : appTheme.primary.DEFAULT,
      maxTrack: isDark
        ? appTheme.dark.componentbg
        : appTheme.placeholdercolor,
      thumb: isDark ? appTheme.dark.mutedForeground : appTheme.componentbg,
    }),
    [isDark]
  );

  const handleApply = () => {
    if (min > max) { return alert("Rango inválido, verifique que el monto mínimo sea menor."); }
    else {
      onApply(min, max);
      onClose();
    }
  };

  const handleClear = () => {
    setMin(0);
    setMax(safeMaxMonto);
    setDragMin(0);
    setDragMax(safeMaxMonto);
    onApply(null, null);
    onClose();
  };

  return (
    <FilterModal
      visible={visible}
      onClean={handleClear}
      onClose={onClose}
      onApply={handleApply}
      title="Rango de Montos a Filtrar"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-4 py-2">
          {/* min */}
          <Text className="mb-2 text-foreground dark:text-dark-foreground font-medium">
            Monto mínimo: {dragMin} {currencyDollar}
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={safeMaxMonto}
            step={50}
            value={min}
            onValueChange={(val) => {
              minRef.current = val;
              setDragMin(val); // preview
            }}
            onSlidingComplete={(val) => {
              setMin(val); // save to end drag
            }}
            minimumTrackTintColor={sliderColors.minTrack}
            maximumTrackTintColor={sliderColors.maxTrack}
            thumbTintColor={sliderColors.thumb}
          />

          {/* Nax */}
          <Text className="mb-2 mt-6 text-foreground dark:text-dark-foreground font-medium">
            Monto máximo: {dragMax} {currencyDollar}
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={safeMaxMonto}
            step={50}
            value={max}
            onValueChange={(val) => {
              maxRef.current = val;
              setDragMax(val); 
            }}
            onSlidingComplete={(val) => {
              setMax(val); 
            }}
            minimumTrackTintColor={sliderColors.minTrack}
            maximumTrackTintColor={sliderColors.maxTrack}
            thumbTintColor={sliderColors.thumb}
          />
        </View>
      </KeyboardAvoidingView>
    </FilterModal>
  );
}
