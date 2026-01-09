import { currencyDollar, currencyVED, totalVenezuela } from "@/utils/moneyFormat";
import { Text, View } from "react-native";
import { PlanPagos } from "../interfaces/PlanPagos";

interface Props {
  item: PlanPagos;
}

export function AuthorizedItem({ item }: Props) {
  return (
    <View className="mb-2 p-3 rounded-xl bg-white/60 dark:bg-black/20">
      <View className="flex-row justify-between">
        <View>
          <Text className="font-semibold text-foreground dark:text-dark-foreground">{item.beneficiario}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{item.observacion}</Text>

          <View className="flex-row items-baseline gap-1">
            <Text className="font-light text-primary dark:text-dark-primary">
              {totalVenezuela(item.montoautorizado ?? 0)}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-300">
              {item.monedaautorizada==="USD"?currencyDollar:currencyVED}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
