import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function RateInput({
  value,
  onChangeValue,
  placeholder = "0.00",
}: {
  value: number;
  onChangeValue: (num: number) => void;
  placeholder?: string;
}) {
  const [touched, setTouched] = useState(false);

  const [textValue, setTextValue] = useState(value?.toString() || "");
  const { isDark } = useThemeStore();

  useEffect(() => {
    const stringValue = value?.toString() || "";
    if (parseFloat(textValue) !== value) {
      setTextValue(value === 0 ? "" : stringValue);
    }
  }, [value]);

  const isValid = !isNaN(value) && value > 0;

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/,/g, ".");

    if ((cleaned.match(/\./g) || []).length > 1) return;

    setTextValue(cleaned);

    if (cleaned.endsWith(".")) return;

    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      onChangeValue(parsed);
    } else if (cleaned === "") {
      onChangeValue(0);
    }
  };

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-xl px-2 bg-transparent dark:bg-dark-componentbg
          ${touched && !isValid ? "border-red-500 dark:border-red-300" : "border-gray-300 dark:border-gray-600"}
        `}
      >
        <TextInput
          className="flex-1 px-2 py-4 text-black dark:text-white"
          placeholder={placeholder}
          value={textValue}
          placeholderTextColor={
            isDark ? appTheme.dark.placeholdercolor : appTheme.placeholdercolor
          }
          keyboardType="numeric"
          onBlur={() => {
            setTouched(true);

            const finalParsed = parseFloat(textValue) || 0;
            setTextValue(finalParsed.toString());
          }}
          onChangeText={handleChangeText}
        />
      </View>
      {!isValid && touched && (
        <Text className="text-red-500 text-xs mt-1">Valor inválido</Text>
      )}
    </View>
  );
}
