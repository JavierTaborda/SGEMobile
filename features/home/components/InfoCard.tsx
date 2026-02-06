import { Text, View } from "react-native";

type InfoCardProps = {
  icon?: React.ReactNode; // Cambiado a ReactNode para mayor flexibilidad
  title: string;
  value: string | number;
  variant?: "default" | "primary"; // Uso de variantes en lugar de props manuales
};

export const InfoCard = ({
  icon,
  title,
  value,
  variant = "default",
}: InfoCardProps) => {
  const isPrimary = variant === "primary";

  return (
    <View
      className={`
        rounded-2xl p-3 h-20 justify-between border
        ${
          isPrimary
            ? "bg-primary dark:bg-dark-primary border-primary"
            : "bg-componentbg dark:bg-dark-componentbg border-gray-100 dark:border-neutral-800"
        }
      `}
    >
      <View className="flex-row items-center space-x-2">
        {icon && <View>{icon}</View>}
        <Text
          className={`
            text-[11px] uppercase tracking-wider font-bold text-primary dark:text-dark-primary
          `}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <Text
        className={`
          text-lg font-extrabold tracking-tight
          ${isPrimary ? "text-white" : "text-foreground dark:text-white"}
        `}
        numberOfLines={1}
        adjustsFontSizeToFit // UX: Si el número es muy largo, se encoge solo
      >
        {value}
      </Text>
    </View>
  );
};
