import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { currencyDollar, currencyVED, totalVenezuela } from "@/utils/moneyFormat";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { PlanPagos } from "../interfaces/PlanPagos";
import { AuthorizedItem } from "./AuthItem";


export interface AuthorizedGroupedListProps {
  data: {
    [empresa: string]: {
      [clase: string]: {
        [moneda: string]: {
          total: number;
          items: PlanPagos[];
        };
      };
    };
  };
}

type EmpresaData = AuthorizedGroupedListProps["data"];
type ClasesMap = EmpresaData[string];
type MonedasMap = ClasesMap[string];

/*  HOOK Animates  */
function useExpand(open: boolean) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 250 });
  }, [open]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    height: progress.value === 0 ? 0 : "auto",
    overflow: "hidden",
  }));
}


function ClaseGroup({
  empresa,
  clase,
  monedas,
}: {
  empresa: string;
  clase: string;
  monedas: MonedasMap;
}) {
  const [open, setOpen] = useState(false);
  const style = useExpand(open);

  return (
    <View className="mb-3">
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="flex-row justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-black/20"
      >
        <Text className="font-semibold text-foreground dark:text-dark-foreground">
          {clase}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#999"
        />
      </Pressable>

      <Animated.View style={style} className="ml-3 mt-2">
        {Object.entries(monedas).map(([moneda, group]) => (
          <View
            key={moneda}
            className="mb-3 p-3 rounded-xl bg-componentbg dark:bg-dark-componentbg"
          >
            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold text-foreground dark:text-dark-foreground">
                {moneda === "USD" ? "Dólares" : "Bolívares"}
              </Text>
              <Text className="font-normal text-primary dark:text-dark-primary">
                {totalVenezuela(group.total)}{" "}
                {moneda === "USD" ? currencyDollar : currencyVED}
              </Text>
            </View>

            {group.items.map((item) => (
              <AuthorizedItem key={item.numerodocumento} item={item} />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/* Company  */

function EmpresaGroup({
  empresa,
  clases,
}: {
  empresa: string;
  clases: ClasesMap;
}) {
  const [open, setOpen] = useState(false);
  const style = useExpand(open);
  const { isDark } = useThemeStore();

  const totalsByCurrency: { [key: string]: number } = {};
  Object.values(clases).forEach((claseObj) => {
    Object.entries(claseObj).forEach(([moneda, group]) => {
      if (!totalsByCurrency[moneda]) totalsByCurrency[moneda] = 0;
      totalsByCurrency[moneda] += group.total;
    });
  });

  return (
    <View className="mb-5">
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="flex-row justify-between items-center p-4 rounded-2xl bg-componentbg dark:bg-dark-componentbg"
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name={open ? "chevron-up" : "chevron-down"}
            size={22}
            color={
              isDark ? appTheme.dark.foreground : appTheme.foreground
            }
          />
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            {empresa}
          </Text>
        </View>
        <View className="flex-row gap-6">
          {/* VED */}
          <View className="flex-col items-center">
       
            <Text className="font-light text-primary dark:text-dark-primary">
              
              {totalVenezuela(totalsByCurrency["VED"] || 0)}
              {" "}
              {currencyVED}
            </Text>
          </View>
          {/* USD */}
          <View className="flex-col items-center">
           
            <Text className="font-light text-primary dark:text-dark-primary">
              
              {totalVenezuela(totalsByCurrency["USD"] || 0)}
              {" "}
              {currencyDollar}
            </Text>
          </View>
        </View>
      </Pressable>

      <Animated.View style={style} className="ml-3 mt-3">
        {Object.entries(clases).map(([clase, monedas]) => (
          <ClaseGroup
            key={`${empresa}-${clase}`}
            empresa={empresa}
            clase={clase}
            monedas={monedas}
          />
        ))}
      </Animated.View>
    </View>
  );
}

/*Principal */
export default function AuthorizedGroupedList({
  data,
}: AuthorizedGroupedListProps) {
  return (
    <ScrollView contentContainerClassName="px-4 pb-44">
      {Object.entries(data).map(([empresa, clases]) => (
        <EmpresaGroup key={empresa} empresa={empresa} clases={clases} />
      ))}
    </ScrollView>
  );
}
