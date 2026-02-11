import ErrorView from "@/components/ui/ErrorView";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { totalVenezuela } from "@/utils/moneyFormat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
//import { PieChart } from "react-native-gifted-charts";
import { CurrencySwitch } from "../components/CurrencySwitch";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { PieChartData } from "../interfaces/PieChartData";

import { safeHaptic } from "@/utils/safeHaptics";

import HomeSkeleton from "../components/HomeSkeleton";
import { InfoCard } from "../components/InfoCard";

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
    currency,
    setCurrency,
  } = useHomeScreen();

  const [showLegend, setShowLegend] = useState(true);
  const [selected, setSelected] = useState<PieChartData | null>(null);

  const toggleLegend = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowLegend(!showLegend);
  };

  const handleSelect = (item: PieChartData) => {
    safeHaptic("soft");
    setSelected(selected?.text === item.text ? null : item);
  };

  const currentTotal = currency === "USD" ? totalSaldo : totalSaldoBs;
  const currencySymbol = currency === "USD" ? "$" : "Bs";

  const initialData = useMemo(
    () => ({
      percentage: "100%",
      text: "Total",
      value: currentTotal,
      documents: `${totalCount} documentos`,
      color: isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT,
    }),
    [currentTotal, isDark],
  );

  const displayInfo = selected || initialData;
  const isSlected = !!selected;

  useEffect(() => {
    if (chartData[0]) {
      handleSelect(chartData[0]);
    }
  }, [chartData]);

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorView error={error} getData={fetchData} />;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      className="bg-background dark:bg-dark-background px-4 pt-1"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} />
      }
    >
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Bienvenido de vuelta,
          </Text>
          <Text className="text-slate-900 dark:text-white text-2xl font-bold">
            {name}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mb-3">
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

      <View className="px-4 py-2 rounded-3xl bg-componentbg dark:bg-dark-componentbg mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <View>
            <Text className="text-foreground dark:text-dark-foreground font-bold text-lg">
              Saldos por Empresa
            </Text>
            <Text className="text-gray-600 text-xs mt-0.5">
              {chartData.length}{" "}
              {chartData.length === 1 ? "empresa" : "empresas"}
            </Text>
          </View>

          <CurrencySwitch
            currency={currency}
            onToggle={setCurrency}
            isDark={isDark}
          />
        </View>

        <View className="items-center justify-center ">
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 130,
              height: 130,

              alignItems: "center",
              justifyContent: "center",
              zIndex: 99,
            }}
          >
            <MotiView
              key={displayInfo.text}
              from={{ opacity: 0, translateY: -8, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              exit={{ opacity: 0, translateY: 6, scale: 0.96 }}
              transition={{ type: "timing", duration: 260 }}
              className="items-center justify-center"
            >
              <Text className="text-3xl font-black text-slate-900 dark:text-white">
                {displayInfo.percentage}
              </Text>

              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {displayInfo.text.substring(0, 12)}
              </Text>

              <Text className="text-primary dark:text-dark-primary font-bold text-[11px] mt-0.5 p-1 rounded-2xl bg-componentbg/80 dark:bg-dark-componentbg/45">
                {currencySymbol}
                {selected
                  ? totalVenezuela(displayInfo.value)
                  : totalVenezuela(
                      currency === "USD" ? totalSaldo : totalSaldoBs,
                    )}
              </Text>
            </MotiView>
          </View>
          <PieChart
            data={chartData.map((item) => ({
              ...item,
              focused: selected?.text === item.text,
            }))}
            donut
            sectionAutoFocus
            radius={135}
            innerRadius={isSlected ? 55 : 45}
            animationDuration={400}
            showText={!isSlected}
            labelsPosition="outward"
            paddingHorizontal={25}
            paddingVertical={5}
            textSize={9}
            fontWeight="bold"
            textColor={isDark ? appTheme.dark.foreground : appTheme.foreground}
            innerCircleColor={
              isDark ? appTheme.dark.componentbg : appTheme.componentbg
            }
            showTooltip
            tooltipBackgroundColor={
              isDark ? "rgb(40 40 44 / 0.45)" : "rgb(255 255 255 / 0.8)"
            }
            tooltipHorizontalShift={50}
            tooltipDuration={700}
            onPress={(item: PieChartData) => handleSelect(item)}
          />
        </View>

        <Pressable
          onPress={toggleLegend}
          className=" py-3 border-t border-slate-50 dark:border-slate-700 flex-row justify-center items-center"
        >
          <Text className="text-primary dark:text-dark-primary font-semibold mr-2">
            {showLegend ? "Resumir" : "Ver detalles"}
          </Text>
          <Ionicons
            name={showLegend ? "chevron-up" : "chevron-down"}
            size={16}
            color={
              isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT
            }
          />
        </Pressable>

        {showLegend && (
          <AnimatePresence>
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: 300 }}
              className="overflow-hidden"
            >
              {chartData.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSelect(item)}
                  className={`flex-row items-center p-4 rounded-2xl mb-2 ${
                    selected?.text === item.text
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-slate-50 dark:bg-slate-700/50"
                  }`}
                >
                  <View
                    style={{ backgroundColor: item.color }}
                    className="w-3 h-3 rounded-full mr-4"
                  />
                  <View className="flex-1">
                    <Text className="font-bold text-slate-800 dark:text-slate-100">
                      {item.text}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      {item.percentage} - {item.documents}
                    </Text>
                  </View>
                  <Text className="font-black text-slate-900 dark:text-white">
                    {currencySymbol}
                    {totalVenezuela(item.value)}
                  </Text>
                </Pressable>
              ))}
            </MotiView>
          </AnimatePresence>
        )}
      </View>

      <View className="flex-row gap-4 pt-1">
        <Pressable
          onPress={() => router.push("/authPays")}
          className="flex-1 bg-primary dark:bg-dark-primary h-16 rounded-2xl items-center justify-center   flex-row"
        >
          <Text className="text-white font-bold ml-2 text-lg">
            Autorizar Pagos
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
