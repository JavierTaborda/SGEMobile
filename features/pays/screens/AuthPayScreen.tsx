import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import CustomFlatList from "@/components/ui/CustomFlatList";
import { useAuthPays } from "@/features/pays/hooks/useAuthPays";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { totalVenezuela } from "@/utils/moneyFormat";
import { safeHaptic } from "@/utils/safeHaptics";

import ErrorView from "@/components/ui/ErrorView";
import AuthPayCard from "../components/AuthPayCard";
import AuthPaySkeleton from "../components/AuthPaySkeleton";
import AuthSelectModal from "../components/AuthSelectModal";
import FiltersModal from "../components/PayFilterModal";
import { PlanPagos } from "../interfaces/PlanPagos";


export default function AuthorizationScreen() {
  /* FILTERS / SEARCH*/
  const [searchText, setSearchText] = useState("");
  const [company, setCompany] = useState("CYBERLUX");
  const [authorized, setAuthorized] = useState(false);
  const [currency, setCurrency] = useState("VED");

  const { isDark } = useThemeStore();

  /* DATA*/
  const {
    filteredPays,
    loading,
    methods,
    totalDocumentsAuth,
    totalAutorizadoUSD,
    totalAutorizadoVED,
    handleRefresh,
    refreshing,
    cooldown,
    canRefresh,
    error,
  } = useAuthPays(searchText);

  /*MODALS*/
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [authSelectModalVisible, setAuthSelectModalVisible] = useState(false);


  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((item: PlanPagos) => {
    safeHaptic("selection");
    setSelectionMode(true);

    const id = String(item.numerodocumento);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const exitSelectionMode = useCallback(() => {
    safeHaptic("selection");
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    safeHaptic("selection");
    setSelectionMode(true);
  }, []);

  const selectedItems = useMemo(
    () =>
      filteredPays.filter((i) => selectedIds.has(String(i.numerodocumento))),
    [filteredPays, selectedIds]
  );

  /* HEADER ANIMATION */
  const headerScale = useSharedValue(1);

  useEffect(() => {
    headerScale.value = withTiming(selectionMode ? 1.02 : 1, {
      duration: 200,
    });
  }, [selectionMode]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  /*FLOATING CTA*/
  const { height } = Dimensions.get("window");
  const ctaTranslateY = useSharedValue(height);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    if (selectionMode) {
      ctaTranslateY.value = withTiming(0, { duration: 300 });
      ctaOpacity.value = withTiming(1, { duration: 200 });
    } else {
      ctaTranslateY.value = withTiming(height, { duration: 300 });
      ctaOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [selectionMode]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ctaTranslateY.value }],
    opacity: ctaOpacity.value,
  }));

  /* HEADER TEXT */
  const headerTitle = useMemo(() => {
    if (!selectionMode) return `${totalDocumentsAuth} documentos`;
    return `${selectedIds.size}/${totalDocumentsAuth} documentos`;
  }, [selectionMode, selectedIds.size, totalDocumentsAuth]);

  /*HANDLERS */
  
  const handleAuthorize = useCallback(() => {
    setAuthSelectModalVisible(true);
  }, []);


  const renderItem = useCallback(
    ({ item }: { item: PlanPagos }) => {
      const id = String(item.numerodocumento);

      return (
        <AuthPayCard
          item={item}
          selectionMode={selectionMode}
          selected={selectedIds.has(id)}
          onSelect={toggleSelect}
          onLongPress={() => {
            safeHaptic("success");
            setSelectionMode(true);
            toggleSelect(item);
          }}
        />
      );
    },
    [selectionMode, selectedIds, toggleSelect]
  );

  if (loading) return <AuthPaySkeleton />;
  if (error) return <ErrorView error={error} getData={handleRefresh} />;

  return (
    <>
      <ScreenSearchLayout
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Observación o beneficiario..."
        onFilterPress={() => setFilterModalVisible(true)}
        extrafilter={false}
        headerVisible={false}
      >
        {/* HEADER */}
        <Animated.View
          style={headerAnimatedStyle}
          className={`
            px-3 py-4 mx-4 mt-2 mb-4 rounded-2xl
            flex-row items-center justify-between
            ${
              selectionMode
                ? "bg-primary/10 dark:bg-dark-primary/30 border border-primary/30"
                : "bg-componentbg dark:bg-dark-componentbg"
            }
          `}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`
                w-9 h-9 rounded-xl items-center justify-center
                ${
                  selectionMode
                    ? "bg-primary dark:bg-dark-primary"
                    : "bg-gray-200 dark:bg-gray-700"
                }
              `}
            >
              <Entypo name="documents" size={20} color="white" />
            </View>

            <View>
              <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">{headerTitle}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {selectionMode
                  ? "Selecciona documentos a autorizar"
                  : "Pagos pendientes de autorización"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={selectionMode ? exitSelectionMode : enterSelectionMode}
            className={`
              px-3 py-2 rounded-xl flex-row items-center gap-2
              ${
                selectionMode
                  ? "bg-red-500/10 border border-red-500"
                  : "bg-primary/10 border border-primary"
              }
            `}
          >
            <MaterialCommunityIcons
              name="checkbox-multiple-marked-outline"
              size={18}
              color={
                selectionMode
                  ? appTheme.error
                  : isDark
                    ? appTheme.dark.primary.DEFAULT
                    : appTheme.primary.DEFAULT
              }
            />
            <Text
              className={`font-semibold text-sm ${
                selectionMode
                  ? "text-red-600 dark:text-red-400"
                  : "text-primary dark:text-dark-primary"
              }`}
            >
              {selectionMode ? "Cancelar" : "Seleccionar"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* LIST */}
        <CustomFlatList
          data={filteredPays}
          keyExtractor={(item) => String(item.numerodocumento)}
          refreshing={refreshing}
          canRefresh={canRefresh}
          handleRefresh={handleRefresh}
          cooldown={cooldown}
          showtitle
          title="Total autorizado"
          subtitle={`${totalVenezuela(totalAutorizadoVED)} VED / ${totalVenezuela(
            totalAutorizadoUSD
          )} $`}
          renderItem={renderItem}
        />
      </ScreenSearchLayout>

      {/* FLOATING CTA */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            width: "55%",
          },
          floatingStyle,
        ]}
      >
        <TouchableOpacity
          disabled={selectedIds.size === 0}
          onPress={handleAuthorize}
          className={`
            py-4 rounded-3xl items-center
            ${
              selectedIds.size === 0
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-primary dark:bg-dark-primary"
            }
          `}
        >
          <Text className="text-white font-bold text-xl">
            Autorizar pagos ({selectedIds.size})
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* MODALS */}
      {filterModalVisible && (
        <FiltersModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={(company, currency, authorized) => {
            setCompany(company);
            setCurrency(currency);
            setAuthorized(authorized);
            setFilterModalVisible(false);
          }}
          selectedCompany={company}
          selectedCurrency={currency}
          selectedAuthorized={authorized}
        />
      )}

      {authSelectModalVisible && (
        <AuthSelectModal
          visible={authSelectModalVisible}
          items={selectedItems}
          methods={methods}
          onClose={() => setAuthSelectModalVisible(false)}
          onAuthorize={async () => {
            setAuthSelectModalVisible(false);
            exitSelectionMode();
          }}
        />
      )}
    </>
  );
}
