import BottomModal from "@/components/ui/BottomModal";
import ProductSkeleton from "./ProductSkeleton";
import ProductItem from "./ProductsItem";

import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { OrderApprovalProduct } from "../../types/OrderApproval";

type Props = {
  visible: boolean;
  onClose: () => void;
  products: OrderApprovalProduct[];
  loading?: boolean;
  error?: boolean;
  total?: number;
};

export default function ProductListModal({
  visible,
  onClose,
  products,
  loading,
  error,
  total,
}: Props) {
  useEffect(() => {
    if (error) {
      Alert.alert(
        "Error ",
        "Ocurrió un error al cargar los productos. Por favor intente de nuevo. ",
        [{ text: "OK", onPress: onClose }]
      );
    }
  }, [error]);

  const totalFactura = total?.toFixed(2);
  const facturaNumero = products[0]?.fact_num ?? "N/A";
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const renderProductItem = useCallback(
    ({ item, index }: { item: OrderApprovalProduct; index: number }) => (
      <ProductItem
        item={item}
        index={index}
        currency={currencyDollar}
        isExpanded={expandedIndex === index}
        onToggleExpand={() =>
          setExpandedIndex(expandedIndex === index ? null : index)
        }
      />
    ),
    [currencyDollar, expandedIndex]
  );

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <View className="flex-1 pt-2">
        {loading ? (
          <>
            <Text className="text-center font-light pb-2 text-foreground dark:text-dark-foreground">
              Cargando Detalles...
            </Text>
            <ProductSkeleton count={5} />
          </>
        ) : products.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="alert-circle-outline" size={64} color="#E53E3E" />
            <Text className="text-center text-red-600 dark:text-red-400 text-lg mt-4 font-semibold">
              No se encontraron productos para este pedido.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="mt-6 bg-primary dark:bg-dark-primary px-8 py-3 rounded-full shadow-xs"
            >
              <Text className="text-white font-semibold text-lg">Cerrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-2xl font-semibold mb-2 text-foreground dark:text-dark-foreground">
              Pedido #{facturaNumero}
            </Text>

            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 ">
              {products.length}{" "}
              {products.length === 1 ? "artículo" : "artículos"}
            </Text>

            <FlatList
              className="pt-1"
              data={products}
              keyExtractor={(item) => item.reng_num.toString()}
              renderItem={renderProductItem}
              contentContainerStyle={{ paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
            />

            <View className="absolute bottom-20 left-0 right-0 px-6 py-4 bg-componentbg dark:bg-dark-componentbg flex-row justify-between items-center rounded-t-xl shadow-sm shadow-black/10">
              <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
                Total
              </Text>
              <Text className="text-xl font-extrabold text-primary dark:text-dark-primary">
                {totalVenezuela(totalFactura || 0)} {currencyDollar}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="bg-primary dark:bg-dark-primary rounded-full py-4 px-6  mx-5 flex-row justify-center items-center shadow-sm"
            >
              {/* <Ionicons name="arrow-back-outline" size={20} color="white" /> */}
              <Text className="text-white font-bold text-lg ml-2">Cerrar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </BottomModal>
  );
}
