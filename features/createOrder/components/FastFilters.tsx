import { useThemeStore } from "@/stores/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  notUsed: boolean;
  setNotUsed: (value: boolean) => void;

  sortByAvailable: boolean;
  setSortByAvailable: (value: boolean) => void;

  sortByAssigned: boolean;
  setSortByAssigned: (value: boolean) => void;
}

export default function FastFilters({
  notUsed,
  setNotUsed,
  sortByAvailable,
  setSortByAvailable,
  sortByAssigned,
  setSortByAssigned,
}: Props) {
  const { isDark } = useThemeStore();
  const iconColor = isDark ? "grey" : "grey";

  const renderButton = (
    label: string,
    active: boolean,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    onPress: () => void,
    rotateIcon?: boolean
  ) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${label}`}
      className={`flex-row items-center px-3 py-3 rounded-full ${
        active
          ? "bg-primary dark:bg-dark-primary"
          : "bg-componentbg dark:bg-dark-componentbg"
      }`}
    >
      <Text
        className={`text-sm ${
          active
            ? "text-white"
            : "text-mutedForeground dark:text-dark-mutedForeground"
        }`}
      >
        {label}
      </Text>
      <Ionicons
        name={icon}
        size={rotateIcon ? 18 : 14}
        color={active ? "white" : iconColor}
        style={{ marginLeft: 3 }}
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-row gap-1">
      {renderButton("No usados", notUsed, notUsed ? "eye" : "eye-off", () =>
        setNotUsed(!notUsed)
      )}
      {renderButton(
        "Disponibles",
        sortByAvailable,
        sortByAvailable? "arrow-down" : "arrow-up",
        () => setSortByAvailable(!sortByAvailable)
      )}
      {renderButton(
        "Asignados",
        sortByAssigned,
        sortByAssigned ? "arrow-down" : "arrow-up",
        () => setSortByAssigned(!sortByAssigned)
      )}
    </View>
  );
}
