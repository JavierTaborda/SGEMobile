import ErrorView from "@/components/ui/ErrorView";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { totalVenezuela } from "@/utils/moneyFormat";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import HomeSkeleton from "../components/HomeSkeleton";
import { InfoCard } from "../components/InfoCard";
import { ModuleButton } from "../components/ModuleButton";
import { useHomeScreen } from "../hooks/useHomeScreen";

export default function HomeScreen() {
  const { session, name } = useAuthStore();
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
  const pieData = [
    {
      value: 47,
      color: "#4F46E5",
      gradientCenterColor: "#6366F1",
      focused: true,
      text: "Excelente",
    },
    {
      value: 40,
      color: "#10B981",
      gradientCenterColor: "#34D399",
      text: "Bueno",
    },
    {
      value: 10,
      color: "#F59E0B",
      gradientCenterColor: "#FBBF24",
      text: "Regular",
    },
    {
      value: 3,
      color: "#EF4444",
      gradientCenterColor: "#F87171",
      text: "Malo",
    },
  ];

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
            Bienvenido, {name}
          </Text>
          {/* <Text className="text-lg text-foreground dark:text-dark-foreground  font-semibold">
            {" "}
            {session?.user.email}
          </Text> */}
        </View>

        {/* Cards */}
        <View className="flex-row flex-wrap justify-between gap-4 mb-3 pt-1">
          <InfoCard title="Documentos autorizados" value={totalPedidos} />
          <InfoCard title="Total " value={`${totalVenezuela(totalNeto)} $`} />
        </View>

        {/* Charts */}
        {/* <Text className="text-xl text-foreground dark:text-dark-foreground font-semibold mb-2 mt-2">
          {emojis.chartUp} {chartText}
        </Text> */}
        {/* <Text className="text-xl text-foreground dark:text-dark-foreground font-bold mb-2 mt-2">
          {chartText}
        </Text> */}
        {/* <ChartLineView
          labels={labels}
          values={values}
          dotLabels={dotLabels}
          isDark={isDark}
        /> */}

        <View className="flex-1 items-center mt-2 mb-2 rounded-3xl bg-componentbg dark:bg-dark-componentbg ">
          <PieChart
            paddingVertical={16}
            data={pieData}
            donut
            showGradient
            radius={110}
            innerRadius={55}
            innerCircleColor={"#232B5D"}
            centerLabelComponent={() => {
              return (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text
                    style={{ fontSize: 22, color: "white", fontWeight: "bold" }}
                  >
                    47%
                  </Text>
                  <Text style={{ fontSize: 14, color: "white" }}>
                    Excellent
                  </Text>
                </View>
              );
            }}
          />
          <View className=" w-full px-6">
            {pieData.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between mb-2"
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-4 h-4 rounded-xl"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  <Text className="text-foreground dark:text-dark-foreground text-sm">
                    {item.text}
                  </Text>
                </View>

                <Text className="text-foreground dark:text-dark-foreground font-semibold text-sm">
                  {item.value}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between pt-4">
          <View className="w-[49%] mb-4">
            <ModuleButton
              //icon={emojis.approved}
              //icon={   emojis.package}
              label="Autorización de Pagos"
              onPress={() => router.push("/(main)/(tabs)/(pays)/authPays")}
              bgColor="bg-primary dark:bg-dark-primary"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
