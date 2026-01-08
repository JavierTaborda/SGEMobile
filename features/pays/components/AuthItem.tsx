import { totalVenezuela } from "@/utils/moneyFormat";
import { Text, View } from "react-native";
import { PlanPagos } from "../interfaces/PlanPagos";

interface Props {
  item: PlanPagos;

}

export function AuthorizedItem({ item }:  Props ) {
  return (
    <View className=" mb-3 p-4 rounded-2xl bg-componentbg dark:bg-dark-componentbg">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-semibold text-base">{item.beneficiario}</Text>
          <Text className="text-xs text-gray-500">
            Doc #{item.numerodocumento}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-bold text-primary dark:text-dark-primary">
            {totalVenezuela(item.montoautorizado ?? 0)}
          </Text>
          <Text className="text-xs text-gray-500">{item.moneda}</Text>
        </View>
      </View>
    </View>
  );
}
