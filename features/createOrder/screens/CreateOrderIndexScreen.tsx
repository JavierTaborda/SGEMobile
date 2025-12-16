import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  Easing,
  FadeIn,
  FadeOut,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import ErrorView from "@/components/ui/ErrorView";
import Loader from "@/components/ui/Loader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FastFilters from "../components/FastFilters";
import ItemModal from "../components/ItemModal";
import OrderModal from "../components/OrderModal";
import ProductCard from "../components/ProductCard";
import useCreateOrder from "../hooks/useCreateOrder";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import { OrderItem } from "../types/orderItem";

export default function CreateOrderScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const { height } = Dimensions.get("window");

  const {
    loading,
    error,
    filteredProducts,
    handleRefresh,
    refreshing,
    canRefresh,
    notUsed,
    setNotUsed,
    sortByAvailable,
    setSortByAvailable,
    sortByAssigned,
    setSortByAssigned,
    handleSummary,
    loadSummary,
  } = useCreateOrder(searchText);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItemVisible, setModalItemVisible] = useState(false);
  const [item, setItem] = useState<OrderItem>({} as OrderItem);
  const { items } = useCreateOrderStore();
  const haveOrder = items?.length > 0;

  // Animation shared values
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  const toggleOrderPanel = useCallback(
    (open: boolean) => {
      translateY.value = withTiming(open ? 0 : height, {
        duration: 500,
        easing: open ? Easing.out(Easing.exp) : Easing.in(Easing.exp),
      });
      opacity.value = withTiming(open ? 1 : 0, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
    },
    [height]
  );

  useEffect(() => toggleOrderPanel(haveOrder), [haveOrder, toggleOrderPanel]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));


  const handleSetModalItemVisible = useCallback((it: OrderItem) => {
    setItem(it);
    setModalItemVisible(true);
  }, []);

  // renderItem is stable thanks to useCallback
  const renderProductItem = useCallback(
    ({ item }: { item: OrderItem }) => (
      <ProductCard
        codart={item.codart}
        artdes={item.artdes}
        price={item.price}
        available={item.available}
        almacen=""
        setModalItemVisible={() => handleSetModalItemVisible(item)}
      />
    ),
    [handleSetModalItemVisible]
  );

  const bottomButtons = (
    <Animated.View
      style={[
        {
          position: "absolute",
          zIndex: 50,
          bottom: 120,
          paddingHorizontal: 24,
          width: "100%",
          flexDirection: "row",
          gap: 12,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        disabled={!haveOrder}
        className="p-4 flex-1 items-center justify-center rounded-full shadow-lg bg-primary dark:bg-dark-primary"
        onPress={handleSummary}
      >
        {loadSummary ? (
          <ActivityIndicator color="white" />
        ) : (
          <View className="flex-row gap-1 items-center">
            <Ionicons name="checkmark-sharp" size={24} color="white" />
            <Text className="text-lg font-semibold text-white">Confirmar</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        disabled={!haveOrder}
        onPress={() => setModalVisible(true)}
        className="p-4 rounded-full shadow-lg bg-primary dark:bg-dark-primary"
        accessibilityHint="Ver Pedido"
        accessibilityLabel="Ver Pedido"
        accessibilityRole="button"
      >
        <Ionicons name="bag" size={24} color="white" />

        {items.length > 1 && (
          <Animated.View
            entering={BounceIn.delay(100)
              .duration(200)
              .easing(Easing.inOut(Easing.quad))}
            exiting={FadeOutDown.duration(200).easing(
              Easing.inOut(Easing.quad)
            )}
            className="absolute right-1 top-0 bg-tertiary dark:bg-dark-tertiary rounded-full px-1 min-w-[35px] max-w-[45] items-center justify-center"
          >
            <Text className="text-white font-bold text-sm ">
              {items?.length}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
  const FullScreenLoaderOverlay = (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}

      className="absolute top-0 left-0 right-0 bottom-0 z-[999] justify-center align-middle bg-overlay dark:bg-dark-overlay"
      pointerEvents="auto"
    >
      <ActivityIndicator size="large" color="#fff" />
    </Animated.View>
  );
  if (error) return <ErrorView error={error} getData={handleRefresh} />;

  return (
    <ScreenSearchLayout
      searchText={searchText}
      setSearchText={setSearchText}
      placeholder="Código o descripción..."
      onFilterPress={() => setFilterModalVisible(true)}
      headerVisible={headerVisible}
      extrafilter={true}
      extraFiltersComponent={
        <FastFilters
          notUsed={notUsed}
          setNotUsed={setNotUsed}
          sortByAvailable={sortByAvailable}
          setSortByAvailable={setSortByAvailable}
          sortByAssigned={sortByAssigned}
          setSortByAssigned={setSortByAssigned}
        />
      }
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <CustomFlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => `${item.codart}-${index}`}
            refreshing={refreshing}
            canRefresh={canRefresh}
            handleRefresh={handleRefresh}
            onHeaderVisibleChange={setHeaderVisible}
            showtitle={true}
            numColumns={2}
            showScrollTopButton={false}
          />

          {bottomButtons}

          <OrderModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onConfirm={() => {
              setModalVisible(false);
              handleSummary();
            }}
          />

          <BottomModal
            visible={modalItemVisible}
            onClose={() => setModalItemVisible(false)}
            heightPercentage={0.85}
          >
            <ItemModal onClose={setModalItemVisible} item={item} />
          </BottomModal>
        </>
      )}

      {loadSummary && FullScreenLoaderOverlay}
    </ScreenSearchLayout>
  );
}
