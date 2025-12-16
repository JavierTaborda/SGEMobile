import { useState } from "react";
import { Alert } from "react-native";
import { OrderApproval, OrderApprovalProduct } from "../types/OrderApproval";

export function useOrderModals() {
    const [selectedOrder, setSelectedOrder] = useState<OrderApproval>();
    const [modalInfoVisible, setModalInfoVisible] = useState(false);
    const [modalProductsVisible, setModalProductsVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<OrderApprovalProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const handleOpenInfoModal = (order: OrderApproval) => {
        setSelectedOrder(order);
        setModalInfoVisible(true);
    };

    const handleOpenProductsModal = async (order: OrderApproval) => {
        try {
            setSelectedOrder(order);
            setLoadingProducts(true);
            setSelectedProducts(order.reng_ped); // or getOrderProducts
            setModalProductsVisible(true);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los productos del pedido" + error);
        } finally {
            setLoadingProducts(false);
        }
    };

    return {
        selectedOrder,
        modalInfoVisible,
        setModalInfoVisible,
        modalProductsVisible,
        setModalProductsVisible,
        selectedProducts,
        loadingProducts,
        handleOpenInfoModal,
        handleOpenProductsModal,
    };
}
