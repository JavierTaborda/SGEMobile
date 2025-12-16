import ProgressBar from "@/components/charts/ProgressBar";
import CustomImage from "@/components/ui/CustomImagen";
import { imageURL } from "@/utils/imageURL";
import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { Text, View } from "react-native";
import { Goals } from "../types/Goals";

type Props = {
  item: Goals;
  hasPermission?: boolean;
};

function GoalItemCard({ item, hasPermission }: Props) {
  const img = `${imageURL}${item.codart?.trim()}.jpg`;

  const {
    disponibles,
    disText,
    usadosText,
    asignadosText,
    progress,
    perc,
    statusColor,
    statusLabel,
    showBadge,
  } = useMemo(() => {
    const disponibles = item.asignado - item.utilizado;
    const disText = disponibles > 1 ? "disponibles" : "disponible";
    const usadosText = item.utilizado > 1 ? "usados" : "usado";
    const asignadosText = item.asignado > 1 ? "asignados" : "asignado";
    const progress = item.asignado > 0 ? item.utilizado / item.asignado : 0;
    const perc = (progress * 100).toFixed(0);

    const statusColor =
      disponibles < 0 || disponibles === item.asignado
        ? "bg-red-500 dark:bg-dark-red-500"
        : disponibles === 0
          ? "bg-amber-400 dark:bg-yellow-400"
          : "bg-tertiary dark:bg-dark-tertiary";

    const statusLabel =
      disponibles === 0 ? " meta cumplida" : `${disponibles} ${disText}`;

    const showBadge = statusLabel === " meta cumplida";

    return {
      disponibles,
      disText,
      usadosText,
      asignadosText,
      progress,
      perc,
      statusColor,
      statusLabel,
      showBadge,
    };
  }, [item]);

  return (
    <View className="mb-3 p-3 bg-componentbg dark:bg-dark-componentbg rounded-2xl shadow-md shadow-black/10">
      <View className="flex-row items-center mb-2">
        <View className="w-20 h-20 rounded-xl bg-bgimages dark:bg-gray-800 justify-center items-center overflow-hidden mr-4 shadow-sm">
          <CustomImage img={img} />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground">
            {item.codart || "N/A"}
          </Text>
          <Text className="text-sm font-normal text-foreground dark:text-dark-foreground">
            {item.artdes || "Sin descripción"}
          </Text>
          {item.vendes && hasPermission && (
            <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground">
              {item.vendes}
            </Text>
          )}
        </View>

        <View className="ml-3">
          <View
            className={`flex-row items-center px-3 py-1.5 rounded-xl ${statusColor}`}
          >
            {showBadge && (
              <Ionicons name="ribbon-outline" size={14} color={"white"} />
            )}

            <Text className="text-white text-sm font-semibold">
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <View>
        <View className="flex-row justify-between">
          <Text
            className={`text-sm ${
              item.utilizado < 1
                ? "text-red-500 dark:text-dark-red-500 font-semibold"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {item.utilizado} {usadosText}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {item.asignado} {asignadosText}
          </Text>
        </View>

        <ProgressBar progress={progress} />

        <View className="flex-row justify-center items-center">
          <Text
            className={`text-sm font-medium ${
              item.utilizado < 1
                ? "text-red-500 dark:text-dark-red-500"
                : "text-primary dark:text-dark-primary"
            }`}
          >
            {perc}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(GoalItemCard);
// Memo to avoid re-renders if props not change
