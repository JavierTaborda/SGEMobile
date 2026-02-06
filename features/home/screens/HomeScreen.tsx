import { Ionicons } from "@expo/vector-icons"; // Opcional para iconos
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { totalVenezuela } from "@/utils/moneyFormat";
import { useHomeScreen } from "../hooks/useHomeScreen";

import ErrorView from "@/components/ui/ErrorView";
import HomeSkeleton from "../components/HomeSkeleton";
import { InfoCard } from "../components/InfoCard";
import { ModuleButton } from "../components/ModuleButton";
import { PieChartData } from "../interfaces/PieChartData";

export default function HomeScreen() {
  const { name } = useAuthStore();
  const { isDark } = useThemeStore();
  const {
    loading,
    error,
    chartData,
    totalCount,
    totalSaldo,
    totalSaldoBs,
    fetchData,
  } = useHomeScreen();

  const [showLegend, setShowLegend] = useState(true);

  const [selected, setSelected] = useState<PieChartData | null>(null);

  const initialData = useMemo(
    () => ({
      percentage: "100%",
      text: "Total",
      value: totalSaldo,
      color: isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT,
    }),
    [totalSaldo, isDark],
  );

  const displayInfo = selected || initialData;

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorView error={error} getData={fetchData} />;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
      className="bg-background dark:bg-dark-background px-4 pt-4"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchData}
          tintColor={isDark ? "#FFF" : "#000"}
        />
      }
    >
      <View className="mb-2">
        <Text className="text-foreground dark:text-dark-foreground text-2xl font-bold tracking-tight">
          Hola, {name}
        </Text>
      </View>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <InfoCard title="Documentos" value={totalCount} />
        </View>

        <View className="flex-1">
          <InfoCard title="Total $" value={`${totalVenezuela(totalSaldo)} $`} />
        </View>

        <View className="flex-1">
          <InfoCard
            title="Total Bs"
            value={`${totalVenezuela(totalSaldoBs)} Bs`}
          />
        </View>
      </View>

      {/* Gráfico y Controles */}
      <View className="p-4 rounded-3xl bg-componentbg dark:bg-dark-componentbg items-center">
        <View className="flex-row justify-between items-center w-full mb-6">
          <Text className="text-foreground dark:text-dark-foreground font-semibold text-lg">
            Saldos USD
          </Text>
          <Pressable
            onPress={() => setShowLegend(!showLegend)}
            className="bg-primary/10 dark:bg-dark-primary/20 px-3 py-1.5 rounded-full flex-row items-center"
          >
            <Text className="text-primary dark:text-dark-primary font-bold text-xs mr-1">
              {showLegend ? "Simplificar" : "Detalles"}
            </Text>
            <Ionicons
              name={showLegend ? "eye-off" : "list"}
              size={14}
              color={
                isDark
                  ? appTheme.dark.primary.DEFAULT
                  : appTheme.primary.DEFAULT
              }
            />
          </Pressable>
        </View>

        <PieChart
          data={chartData}
          donut
          showGradient
          radius={130}
          innerRadius={65}
          showText={!showLegend}
          textColor="white"
          textSize={10}
          fontWeight="bold"
          innerCircleColor={
            isDark ? appTheme.dark.componentbg : appTheme.componentbg
          }
          onPress={(item: PieChartData) => setSelected(item)}
          centerLabelComponent={() => (
            <Pressable
              className="items-center justify-center"
              onPress={() => setSelected(null)}
            >
              <Text className="text-2xl font-black dark:text-white">
                {displayInfo.percentage}
              </Text>
              <Text className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                {displayInfo.text}
              </Text>
            </Pressable>
          )}
        />

        {/* Leyenda Condicional con Animación Mental */}
        {showLegend && (
          <View className="w-full mt-8 border-t border-gray-100 dark:border-neutral-800 pt-4">
            {chartData.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setSelected(item)}
                className={`flex-row justify-between items-center mb-2 p-3 rounded-2xl ${selected?.text === item.text ? "bg-primary/5 border border-primary/20" : ""}`}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <View>
                    <Text className="text-foreground dark:text-white font-bold text-sm">
                      {item.text}
                    </Text>
                    <Text className="text-gray-500 text-[10px]">
                      {item.percentage} de la deuda
                    </Text>
                  </View>
                </View>
                <Text className="text-foreground dark:text-white font-bold">
                  $
                  {item.value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap justify-between mt-8 mb-4">
        <View className="w-[48%] mb-4">
          <ModuleButton
            label="Autorizar Pagos"
            onPress={() => router.push("/authPays")}
            bgColor="bg-primary dark:bg-dark-primary"
          />
        </View>
      </View>
    </ScrollView>
  );
}
