import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import React from "react";
import { Pressable, Text } from "react-native";
import { ExchangeRate } from "../../../types/exchangerate";

type ExchangeRateBadgeProps = {
  exchangeRate: ExchangeRate;

  onPress: () => void;
};

const ExchangeRateBadge: React.FC<ExchangeRateBadgeProps> = ({
  exchangeRate,

  onPress,
}) => {
  return (
    <Pressable
      className="absolute top-2 right-7 z-40 rounded-2xl bg-componentbg/50 dark:bg-dark-componentbg/50 px-4 py-1"
      onPress={onPress}
    >
      <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Tasa
      </Text>
      <Text className="text-sm font-normal text-gray-600 dark:text-gray-400">
        {totalVenezuela(exchangeRate.tasa_v)} Bs/{currencyDollar}
      </Text>
    </Pressable>
  );
};

export default ExchangeRateBadge;
