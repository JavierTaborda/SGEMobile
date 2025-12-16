import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import CustomFlatList from "@/components/ui/CustomFlatList";

import ErrorView from "@/components/ui/ErrorView";
import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/stores/useAuthStore";
import { totalVenezuela } from "@/utils/moneyFormat";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import OrderApprovalInfoModal from "../components/OrderAprovalInfoModal";
import OrderFilterModal from "../components/OrderFilterModal";
import OrderSearchCard from "../components/OrderSearchCard";
import ProductListModal from "../components/ProductListModal/ProductListModal";
import { useOrderSearch } from "../hooks/useOrdersSearch";
import { OrderApproval } from "../types/OrderApproval";
import { OrderFilters } from "../types/OrderFilters";
export default function OrderSearchScreen() {
  const { role } = useAuthStore();
  const [searchText, setSearchText] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const hasPermission = role === "1" || role === "2";

  const {
    loading,
    refreshing,
    totalOrders,
    totalUSD,
    handleRefresh,
    canRefresh,
    cooldown,

    orders,
    handleOpenInfoModal,
    handleOpenProductsModal,
    setModalInfoVisible,
    modalInfoVisible,
    setModalProductsVisible,
    modalProductsVisible,
    selectedOrder,
    selectedProducts,
    loadingProducts,
    zones,
    sellers,
    filters,
    setFilters,
    statusList,
    procesadoslist,
    activeFiltersCount,

    error,
    fetchOrders,
    markComment,
  } = useOrderSearch(searchText);

  const handleApplyFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setFilterVisible(false);
  };


  const renderOrderItem = useCallback(
    ({ item }: { item: OrderApproval }) => (
      <OrderSearchCard
        item={item}
        onPress={() => handleOpenInfoModal(item)}
        detailModal={() => handleOpenProductsModal(item)}
        hasPermission={hasPermission}
        markComment={markComment}
      />
    ),
    [
      handleOpenInfoModal,
      handleOpenProductsModal,
      hasPermission,
    ]
  );
  if (loading) return <Loader />;

  if (error) {
    return <ErrorView error={error} getData={fetchOrders} />;
  }

  return (
    <>
      <ScreenSearchLayout
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Cliente o número de pedido..."
        onFilterPress={() => setFilterVisible(true)}
        filterCount={activeFiltersCount}
        extrafilter={false}
        headerVisible={false}
      >
        <CustomFlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${item.fact_num}-${index}`}
          refreshing={refreshing}
          canRefresh={canRefresh}
          handleRefresh={()=>handleRefresh(filters)}
          cooldown={cooldown}
          showtitle={true}
          title={`${totalOrders} ${totalOrders > 1 ?  'pedidos': 'pedido'}`}
          subtitle={`Total ${totalVenezuela(totalUSD)}$`}
          ListEmptyComponent={
            <View className="p-10 items-center">
              <Text className="text-foreground dark:text-dark-foreground">
                No se encontraron pedidos...
              </Text>
            </View>
          }
        />
      </ScreenSearchLayout>

      {/* Modales */}
      {modalInfoVisible && (
        <OrderApprovalInfoModal
          visible={modalInfoVisible}
          onClose={() => setModalInfoVisible(false)}
          order={selectedOrder || undefined}
        />
      )}

      {modalProductsVisible && (
        <ProductListModal
          visible={modalProductsVisible}
          onClose={() => setModalProductsVisible(false)}
          products={selectedProducts}
          loading={loadingProducts}
          total={selectedOrder && parseFloat(selectedOrder?.tot_neto)}
        />
      )}

      {filterVisible && (
        <OrderFilterModal
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          filters={filters}
          dataFilters={{
            zones,
            sellers,
            statusList,
            procesadoslist,
          }}
          onApply={handleApplyFilters}
          hasPermission={hasPermission}
        />
      )}
    </>
  );
}
