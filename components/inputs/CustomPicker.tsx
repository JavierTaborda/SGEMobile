import { useThemeStore } from "@/stores/useThemeStore";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomPickerProps = {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  icon?: keyof typeof FontAwesome.glyphMap;
  placeholder?: string;
  error?: string;
};

export default function CustomPicker({
  selectedValue,
  onValueChange,
  items = [],
  icon = "list",
  placeholder = "Seleccione una opción",
  error,
}: CustomPickerProps) {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [iosModalVisible, setIosModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const isValid = !!selectedValue;

  const memoizedItems = useMemo(() => {
    if (!search) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const selectedLabel = useMemo(() => {
    return items.find((i) => i.value === selectedValue)?.label || placeholder;
  }, [items, selectedValue, placeholder]);

  const handleValueChange = useCallback(
    (value: string) => {
      if (value === selectedValue) return;

      setTouched(true);
      onValueChange(value);
    },
    [onValueChange, selectedValue],
  );

  const closeIosModal = () => {
    setFocused(false);
    setIosModalVisible(false);
    setSearch("");
  };

  return (
    <View className="w-full">
      {/* INPUT TRIGGER */}
      <View
        className={`flex-row items-center gap-3 min-h-[48px] px-4 rounded-xl border
        bg-white dark:bg-dark-componentbg
        ${focused ? "border-primary dark:border-dark-primary" : touched && !isValid ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
      >
        {Platform.OS === "android" ? (
          <View className="flex-1">
            <Picker
              mode="dialog"
              selectedValue={selectedValue}
              onValueChange={handleValueChange}
              dropdownIconColor={theme === "dark" ? "#ccc" : "#333"}
              style={{
                color: isValid ? (theme === "dark" ? "#fff" : "#000") : "#999",
              }}
            >
              <Picker.Item label={placeholder} value="" enabled={false} />
              {memoizedItems.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <Pressable
            className="flex-1 py-3 flex-row justify-between items-center"
            onPress={() => {
              setFocused(true);
              setIosModalVisible(true);
            }}
          >
            <Text
              className={`text-base ${isValid ? "text-foreground dark:text-dark-foreground" : "text-gray-400"}`}
            >
              {selectedLabel}
            </Text>
            <FontAwesome name="chevron-down" size={14} color="#888" />
          </Pressable>
        )}
      </View>

      {/* ERROR */}
      {touched && !isValid && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error || "Seleccione una opción"}
        </Text>
      )}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={iosModalVisible}
          animationType="fade"
          onRequestClose={closeIosModal}
        >
          <View className="flex-1 justify-end">
            {/* Fondo con Blur que también cierra al tocar fuera */}
            <BlurView
              intensity={25}
              tint={theme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            >
              <Pressable className="flex-1" onPress={closeIosModal} />
            </BlurView>

            <View
              style={{ paddingBottom: insets.bottom + 10 }}
              className="bg-white dark:bg-dark-componentbg rounded-t-3xl shadow-2xl"
            >
              <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-lg font-bold dark:text-white">
                  {placeholder}
                </Text>
                <TouchableOpacity
                  onPress={closeIosModal}
                  className="bg-primary/10 dark:bg-dark-primary/20 px-4 py-2 rounded-full"
                >
                  <Text className="text-primary dark:text-dark-primary font-bold text-base">
                    Listo
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="px-4 py-3">
                <View className="flex-row items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <FontAwesome name="search" size={14} color="#888" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Filtrar opciones..."
                    placeholderTextColor="#888"
                    className="flex-1 ml-2 dark:text-white h-9"
                    autoCorrect={false}
                  />
                  {search !== "" && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                      <FontAwesome name="times-circle" size={18} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* LISTA DE PICKER */}
              <View className="h-[250px] mb-4">
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={handleValueChange}
                  itemStyle={{
                    fontSize: 20,
                    color: theme === "dark" ? "#fff" : "#000",
                    height: 250,
                  }}
                >
                  <Picker.Item
                    label="-- Sin selección --"
                    value=""
                    color="#888"
                  />
                  {memoizedItems.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
