import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
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

  const isValid = !!selectedValue;
  const selectedLabel =
    items.find((i) => i.value === selectedValue)?.label || placeholder;

  const handleValueChange = (value: string) => {
    setTouched(true);
    onValueChange(value);

    // if (Platform.OS === "ios" && value) {
    //   setTimeout(() => {
    //     setFocused(false);
    //     setIosModalVisible(false);
    //   }, 250);
    // }
  };


  // Nuevo estado para búsqueda
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const iconName = FontAwesome.glyphMap[icon] ? icon : "list";

  return (
    <View className="w-full">
      {/* INPUT */}
      <View
        className={`flex-row items-center gap-3 min-h-[48px] px-4 rounded-xl border
        bg-white dark:bg-dark-componentbg
        ${
          focused
            ? "border-primary dark:border-dark-primary"
            : touched && !isValid
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {/* LEFT ICON
        <FontAwesome
          name={iconName}
          size={20}
          color={
            touched && !isValid
              ? appTheme.error
              : theme === "dark"
                ? (appTheme.dark.secondary.DEFAULT ?? "#ccc")
                : (appTheme.secondary.DEFAULT ?? "#333")
          }
        /> */}

        {/* ANDROID */}
        {Platform.OS === "android" ? (
          <View className="flex-1">
            <Picker
              selectedValue={selectedValue}
              onValueChange={handleValueChange}
              style={{
                color: isValid
                  ? theme === "dark"
                    ? (appTheme.dark.foreground ?? "#fff")
                    : (appTheme.foreground ?? "#000")
                  : (appTheme.placeholdercolor ?? "#999"),
                backgroundColor: "transparent",
              }}
            >
              <Picker.Item
                label={placeholder}
                value=""
                enabled={false}
                color={appTheme.placeholdercolor ?? "#999"}
              />
              {items.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        ) : (
          /* IOS */
          <>
            <Pressable
              className="flex-1 py-3"
              onPress={() => {
                setFocused(true);
                setIosModalVisible(true);
              }}
            >
              <Text
                className={`text-base ${
                  isValid
                    ? "text-foreground dark:text-dark-foreground"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {selectedLabel}
              </Text>
            </Pressable>

            <FontAwesome
              name="chevron-down"
              size={16}
              color={
                theme === "dark"
                  ? (appTheme.dark.muted ?? "#888")
                  : (appTheme.muted ?? "#888")
              }
            />
          </>
        )}
      </View>

      {/* ERROR */}
      {touched && !isValid && (
        <View className="flex-row items-center gap-1 mt-1">
          <FontAwesome
            name="exclamation-circle"
            size={12}
            color={appTheme.error}
          />
          <Text className="text-red-500 text-xs">
            {error || "Seleccione una opción"}
          </Text>
        </View>
      )}

      {/* IOS MODAL */}
      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={iosModalVisible}
          animationType="fade"
          onRequestClose={() => {
            setFocused(false);
            setIosModalVisible(false);
          }}
        >
          <View className="flex-1 bg-black/40">
            {/* OVERLAY */}
            <Pressable
              className="flex-1"
              onPress={() => {
                setFocused(false);
                setIosModalVisible(false);
              }}
            />

            {/* BOTTOM SHEET */}
            <View
              style={{ paddingBottom: insets.bottom }}
              className="bg-white dark:bg-dark-componentbg rounded-t-3xl shadow-2xl overflow-hidden"
            >
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground">
                  Selecciona una opción
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFocused(false);
                    setIosModalVisible(false);
                  }}
                  className="px-3 py-1"
                >
                  <Text className="text-primary dark:text-dark-primary font-semibold">
                    Aceptar
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="h-[320px] mx-2">
                {/* search */}
                <View
                  className="flex-row items-center px-3 py-3 mt-1 mb-2 
                 bg-componentbg dark:bg-dark-componentbg 
                 rounded-2xl border border-gray-300 dark:border-gray-700"
                >
                  
                  <FontAwesome
                    name="search"
                    size={18}
                    color={theme === "dark" ? "#aaa" : "#555"}
                    style={{ marginRight: 8 }}
                  />

                  {/* Input */}
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar..."
                    className="flex-1 text-base text-foreground dark:text-dark-foreground"
                    placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                    clearButtonMode="never" 
                  />

                  {/* Botón limpiar */}
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                      <FontAwesome
                        name="times-circle"
                        size={18}
                        color={theme === "dark" ? "#aaa" : "#555"}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Picker  items filtereds */}
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={handleValueChange}
                  style={{
                    color:
                      theme === "dark"
                        ? (appTheme.dark.foreground ?? "#fff")
                        : (appTheme.foreground ?? "#000"),
                  }}
                >
                  <Picker.Item label={placeholder} value="" />
                  {filteredItems.map((item) => (
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
