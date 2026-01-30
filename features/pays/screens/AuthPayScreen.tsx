import { Entypo, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
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
import CreatePlanModal from "../components/ CreatePlanModal";
import AuthorizedGroupedList from "../components/AuthorizedGroupedList";
import AuthPayCard from "../components/AuthPayCard";
import AuthPaySkeleton from "../components/AuthPaySkeleton";
import AuthSelectModal from "../components/AuthSelectModal";
import ListPaySkeleton from "../components/ListPaySkeleton";
import FiltersModal from "../components/PayFilterModal";
import { PlanPagos } from "../interfaces/PlanPagos";

export default function AuthorizationScreen() {
  /* FILTERS / SEARCH*/
  const [searchText, setSearchText] = useState("");

  const [tab, setTab] = useState<"pending" | "authorized">("pending");
  const pagerRef = useRef<PagerView>(null);
  const { isDark } = useThemeStore();

  /* DATA*/
  const {
    filteredPays,
    loading,
    methods,
    totalDocumentsAuth,
    totalDocumentsUnAuth,
    totalAutorizadoUSD,
    totalAutorizadoVED,
    handleRefresh,
    refreshing,
    cooldown,
    canRefresh,
    error,
    authorizedData,
    filterModalVisible,
    setFilterModalVisible,
    authSelectModalVisible,
    setAuthSelectModalVisible,
    selectionMode,
    setSelectionMode,
    selectedIds,
    setSelectedIds,
    exitSelectionMode,
    enterSelectionMode,
    selectedItems,
    toggleSelect,
    headerTitle,
    handleAuthorize,
    udapteDocuments,
    filterData,
    selectedFilters,
    setSelectedFilters,
    appliedFiltersCount,
    createPlanModaleVisible,
    setCreatePlanModaleVisible,
    createPlanPago,
    refreshData,
    totalDocumentsPlan,
    loadData,
    buildAuthorizedItems,
    buildUnAuthorizedItems,
    handleLoading,
  } = useAuthPays(searchText);

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
    [selectionMode, selectedIds, toggleSelect],
  );

  const handleCreatePlanSuccess = useCallback(() => {
    setCreatePlanModaleVisible(false);

    requestAnimationFrame(() => {
      pagerRef.current?.setPage(0);
      setTab("pending");
    });
    //refreshData();
  }, []);

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
        filterCount={appliedFiltersCount}
      >
        <View className="flex-row justify-center mb-1 px-3 ">
          <View
            className={`h-1 w-[47%] rounded-full ${tab === "pending" ? "bg-primary dark:bg-dark-primary" : "bg-gray-300 dark:bg-dark-componentbg"}`}
          />
          <View
            className={`h-1 w-[47%] rounded-full ml-2 ${tab === "authorized" ? "bg-primary dark:bg-dark-primary" : "bg-gray-300 dark:bg-dark-componentbg"}`}
          />
        </View>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setTab(index === 0 ? "pending" : "authorized");
          }}
          scrollEnabled={!selectionMode}
        >
          <View key="1">
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
                  <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    {headerTitle}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {selectionMode
                      ? "Selecciona documentos a autorizar"
                      : "Pagos pendientes de autorización"}
                  </Text>
                </View>
              </View>

              <Pressable
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
              </Pressable>
            </Animated.View>

            {/* LIST */}

            {handleLoading ? (
              <ListPaySkeleton />
            ) : (
              <CustomFlatList
                data={filteredPays}
                keyExtractor={(item) => `pay-${item.numerodocumento}`}
                refreshing={refreshing}
                canRefresh={canRefresh}
                handleRefresh={handleRefresh}
                cooldown={cooldown}
                showtitle
                title="Total autorizado"
                subtitle={`${totalVenezuela(totalAutorizadoVED)} VED / ${totalVenezuela(
                  totalAutorizadoUSD,
                )} $`}
                renderItem={renderItem}
              />
            )}
          </View>

          <View key="2">
            {/* LIST */}

            <View
              className=" px-3 py-4 mx-4 mt-2 mb-1 rounded-2xl
            flex-row items-center justify-between bg-componentbg dark:bg-dark-componentbg"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center bg-gray-200 dark:bg-gray-700`}
                >
                  <Octicons name="checklist" size={18} color="white" />
                </View>

                <View>
                  <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    {totalDocumentsAuth} documentos autorizados
                  </Text>
                </View>
              </View>
            </View>

            <View className=" mx-4 mt-2 mb-2 rounded-2xl px-2 py-3 items-center  bg-componentbg dark:bg-dark-componentbg">
              <Text className="text-foreground dark:text-dark-foreground font-semibold ">
                {totalVenezuela(totalAutorizadoVED)} VED /{" "}
                {totalVenezuela(totalAutorizadoUSD)} $
              </Text>
            </View>

            {totalDocumentsPlan > 0 ? (
              <>
                <AuthorizedGroupedList data={authorizedData} />
                <View
                  style={{
                    position: "absolute",
                    bottom: 100,
                    alignSelf: "center",
                    width: "80%",
                  }}
                >
                  <Pressable
                    disabled={totalDocumentsPlan < 1}
                    onPress={() => setCreatePlanModaleVisible(true)}
                    className={`py-4 rounded-3xl items-center bg-primary dark:bg-dark-primary`}
                  >
                    <Text className="text-white font-bold text-xl">
                      Crear planificación
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text className="text-foreground dark:text-dark-foreground text-center pt-2 font-semibold">
                Sin documentos autorizados.
              </Text>
            )}
          </View>
        </PagerView>
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
        <Pressable
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
        </Pressable>
      </Animated.View>

      {/* MODALS */}
      {filterModalVisible && (
        <FiltersModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={(filters) => {
            setSelectedFilters(filters);
          }}
          filterData={filterData}
          selectedFilters={selectedFilters}
        />
      )}

      {authSelectModalVisible && (
        <AuthSelectModal
          visible={authSelectModalVisible}
          items={selectedItems}
          methods={methods}
          onClose={() => setAuthSelectModalVisible(false)}
          setVisible={() => setAuthSelectModalVisible(true)}
          onAuthorize={udapteDocuments}
          buildAuthorizedItems={buildAuthorizedItems}
          buildUnAuthorizedItems={buildUnAuthorizedItems}
        />
      )}
      {createPlanModaleVisible && (
        <CreatePlanModal
          visible={createPlanModaleVisible}
          items={filteredPays.filter(
            (d) => d.autorizadopagar === 1 && !d.planpagonumero,
          )}
          onClose={() => setCreatePlanModaleVisible(false)}
          createPlan={async (data) => {
            const response = await createPlanPago(data);

            if (response.success) {
              handleCreatePlanSuccess();
            }

            return response;
          }}
        />
      )}
    </>
  );
}
