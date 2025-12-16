import { ChartLineView } from "@/components/charts/ChartLineView";
import ErrorView from "@/components/ui/ErrorView";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { totalVenezuela } from "@/utils/moneyFormat";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import HomeSkeleton from "../components/HomeSkeleton";
import { InfoCard } from "../components/InfoCard";
import { ModuleButton } from "../components/ModuleButton";
import { useHomeScreen } from "../hooks/useHomeScreen";

export default function HomeScreen() {
  const { session,name } = useAuthStore();
  const { isDark } = useThemeStore();
  const {
    loading,
    error,
    totalsByDate,
    labels,
    values,
    dotLabels,
    totalPedidos,
    totalNeto,
    chartText,
    getData,
  } = useHomeScreen();

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return <ErrorView error={error} getData={getData} />;
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      className="bg-background dark:bg-dark-background px-4 pt-2"
    >
      <View>
        {/* Welcome */}
        <View className="flex-1 items-start mt-2 mb-2">
          {/* <Text className="text-black dark:text-white text-xl font-semibold">
            {emojis.user} Bienvenido
          </Text> */}
          <Text className="text-foreground dark:text-dark-foreground  text-xl font-bold">
            Bienvenido
          </Text>
          <Text className="text-lg text-foreground dark:text-dark-foreground  font-semibold">
            {name}
          </Text>
          {/* <Text className="text-lg text-foreground dark:text-dark-foreground  font-semibold">
            {" "}
            {session?.user.email}
          </Text> */}
        </View>

        {/* Cards */}
        <View className="flex-row flex-wrap justify-between gap-4 mb-4 pt-1">
          <InfoCard
            //icon={emojis.package}
            title="Total Pedidos"
            value={totalPedidos}
            //bgColor="bg-primary dark:bg-dark-primary"
          />
          <InfoCard
            //icon={emojis.money}
            title="Total Neto"
            value={`${totalVenezuela(totalNeto)} $`}
            //bgColor="bg-secondary dark:bg-dark-secondary"
          />
        </View>

        {/* Charts */}
        {/* <Text className="text-xl text-foreground dark:text-dark-foreground font-semibold mb-2 mt-2">
          {emojis.chartUp} {chartText}
        </Text> */}
        <Text className="text-xl text-foreground dark:text-dark-foreground font-bold mb-2 mt-2">
          {chartText}
        </Text>
        <ChartLineView
          labels={labels}
          values={values}
          dotLabels={dotLabels}
          isDark={isDark}
        />

        {/* Modules */}
        {/* <Text className="text-xl text-foreground dark:text-dark-foreground font-semibold pt-2 mb-2 mt-2">
          {emojis.search} Módulos principales
        </Text> */}

        <View className="flex-row flex-wrap justify-between pt-4">
          <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.approved}
              //icon={   emojis.package}
              label="Aprobación Pedidos"
              onPress={() =>
                router.push("/(main)/(tabs)/(orders)/orderApproval")
              }
              bgColor="bg-primary dark:bg-dark-primary"
            />
          </View>
          <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.list}
              //icon={emojis.approved}
              label="Consultar Pedidos"
              onPress={() => router.push("/(main)/(tabs)/(orders)/orderSearch")}
              bgColor="bg-secondary dark:bg-dark-secondary"
            />
          </View>
          <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.list}
              //icon={emojis.approved}
              label="Resumen Metas de Ventas"
              onPress={() => router.push("/(main)/(tabs)/(goals)/goalsResumen")}
              bgColor="bg-green-500 dark:bg-green-400"
            />
          </View>
          <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.list}
              //icon={emojis.approved}
              label="Reportar Devolución "
              onPress={() => router.push("/(main)/(tabs)/(returnReport)")}
              bgColor="bg-green-600 dark:bg-green-300"
            />
          </View>
          {/* <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.bags}
              icon={emojis.approved}
              label="Crear Pedido"
              bgColor="bg-gray-300 dark:bg-gray-700"
              isComingSoon
            />
          </View> */}
        </View>
      </View>
    </ScrollView>
  );
}
