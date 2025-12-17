import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import CustomFlatList from "@/components/ui/CustomFlatList";
import Loader from "@/components/ui/Loader";
import { useAuthPays } from "@/features/pays/hooks/useAuthPays";
import { totalVenezuela } from "@/utils/moneyFormat";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { safeHaptic } from "@/utils/safeHaptics";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";

import AuthPayCard from "../components/AuthPayCard";
import AuthPayModal from "../components/AuthPayModal";
import AuthSelectModal from "../components/AuthSelectModal";
import FiltersModal from "../components/PayFilterModal";
import { AuthPay } from "../types/AuthPay";

export default function AuthorizationScreen() {
  const [searchText, setSearchText] = useState("");
    const [company, setCompany] = useState("CYBERLUX");
    const [authorized, setAuthorized] = useState(false);
    const [currency, setCurrency] = useState("VED");

  const {
    filteredPays,
    loading,
    totalDocumentsAuth,
    totalAutorizadoUSD,
    totalAutorizadoVED,
    handleRefresh,
    refreshing,
    cooldown,
    canRefresh,
  } = useAuthPays(searchText);

  const { isDark } = useThemeStore();

  // Modals
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authSelectModalVisible, setAuthSelectModalVisible] = useState(false);

  // Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<AuthPay[]>([]);
  const [selectedItem, setSelectedItem] = useState<AuthPay | null>(null);

  /* ------------------------------------------------------------------
     HEADER ANIMATION
  ------------------------------------------------------------------ */
  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  useEffect(() => {
    if (selectionMode) {
      headerScale.value = withTiming(1.02, { duration: 200 });
    } else {
      headerScale.value = withTiming(1, { duration: 200 });
    }
  }, [selectionMode]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: headerTranslateY.value },
      { scale: headerScale.value },
    ],
  }));

  /* ------------------------------------------------------------------
     FLOATING BUTTON ANIMATION
  ------------------------------------------------------------------ */
  const { height } = Dimensions.get("window");
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (selectionMode) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(height, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [selectionMode]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  /* ------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------ */
  const toggleSelect = (item: AuthPay) => {
    safeHaptic("selection");
    setSelectionMode(true);
    setSelectedIds((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : [...prev, item]
    );
  };

  const handleOpenAuthModal = (item: AuthPay) => {
    if (selectionMode) return;
    setSelectedItem(item);
    setAuthModalVisible(true);
  };

  const handleAuthorize = () => {
   setAuthSelectModalVisible(true);

    // setSelectedIds([]);
    // setSelectionMode(false);
    // setAuthModalVisible(false);
  };

  if (loading) return <Loader />;

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
        {/*HEADER*/}
        <Animated.View
          style={headerAnimatedStyle}
          className={`
            px-3 py-4 mx-4 mt-2 mb-4 rounded-2xl
            flex-row items-center justify-between
            ${
              selectionMode
                ? "bg-primary/10 dark:bg-dark-primary/20 border border-primary/30"
                : "bg-componentbg dark:bg-dark-componentbg"
            }
          `}
        >
          {/* Left */}
          <View className="flex-row items-center gap-2">
            <View
              className={`
                w-8 h-8 rounded-xl items-center justify-center
                ${
                  selectionMode
                    ? "bg-primary dark:bg-dark-primary"
                    : "bg-gray-200 dark:bg-gray-700"
                }
              `}
            >
              <Entypo name={"documents"} size={20} color="white" />
            </View>

            <View>
              <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
                {selectionMode
                  ? `${selectedIds.length}/${totalDocumentsAuth} documentos`
                  : `${totalDocumentsAuth} documentos`}
              </Text>

              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {selectionMode
                  ? "Selecione documentos a autorizar"
                  : "Pagos pendientes de autorización"}
              </Text>
            </View>
          </View>

          {/* Right */}
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]);
              safeHaptic("selection");
            }}
            className={`
              px-2 py-2 rounded-xl flex-row items-center gap-2
              ${
                selectionMode
                  ? "bg-red-500/10 border border-red-500"
                  : "bg-primary/10 border border-primary"
              }
            `}
          >
            <MaterialCommunityIcons
              name={
                selectionMode
                  ? "checkbox-multiple-marked-outline"
                  : "checkbox-multiple-marked-outline"
              }
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
              className={`
                font-semibold text-sm
                ${
                  selectionMode
                    ? "text-red-600 dark:text-red-400"
                    : "text-primary dark:text-dark-primary"
                }
              `}
            >
              {selectionMode ? "Cancelar" : "Seleccionar"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <CustomFlatList
          data={filteredPays}
          keyExtractor={(item, index) => `${item.numerodocumento}-${index}`}
          refreshing={refreshing}
          canRefresh={canRefresh}
          handleRefresh={handleRefresh}
          cooldown={cooldown}
          showtitle
          title="Total autorizado"
          subtitle={`${totalVenezuela(
            totalAutorizadoVED
          )} VED / ${totalVenezuela(totalAutorizadoUSD)} $`}
          renderItem={({ item }) => (
            <AuthPayCard
              item={item}
              selectionMode={selectionMode}
              selected={selectedIds.includes(item)}
              onSelect={toggleSelect}
              onPress={handleOpenAuthModal}
            />
          )}
        />
      </ScreenSearchLayout>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 100,
            marginHorizontal: "auto",
            paddingHorizontal: 24,
            width: "65%",
          },
          floatingStyle,
        ]}
      >
        <TouchableOpacity
          disabled={selectedIds.length === 0}
          onPress={handleAuthorize}
          className={`
            py-4 rounded-3xl items-center px-4
            ${
              selectedIds.length === 0
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-primary dark:bg-dark-primary"
            }
          `}
        >
          <Text className="text-white font-bold text-xl shadow-lg">
            Autorizar pagos{" "}
            {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Text>
        </TouchableOpacity>
      </Animated.View>

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

      {authModalVisible && selectedItem && (
        <AuthPayModal
          visible={authModalVisible}
          item={selectedItem}
          onClose={() => setAuthModalVisible(false)}
          onAuthorize={handleAuthorize}
        />
      )}
      {authSelectModalVisible &&(
        <AuthSelectModal
          visible={authSelectModalVisible}
          item={ selectedIds.length > 0 ? selectedIds : selectedItem ? [selectedItem] : [] }
          onClose={() => setAuthSelectModalVisible(false)}
          onAuthorize={handleAuthorize}
        />
      )}
    </>
  );
}
