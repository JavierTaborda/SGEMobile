import { useRefreshControl } from "@/utils/userRefreshControl";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
    getPedidosFiltrados, UpdateComment
} from "../services/OrderService";
import { OrderApproval } from "../types/OrderApproval";
import { OrderFilters } from "../types/OrderFilters";
import { useOrderFilters } from "./useOrderFilters";
import { useOrderModals } from "./useOrderModals";

export function useOrderSearch(searchText: string) {
    /* -------------------------------------------------------------------------- */
    /*                                  STATES                                  */
    /* -------------------------------------------------------------------------- */

    const [orders, setOrders] = useState<OrderApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // filtros
    const { filters, loadFilters, sellers, zones, statusList, procesadoslist, setFilters } =
        useOrderFilters();

    const {
        refreshing,
        canRefresh,
        cooldown,
        wrapRefresh,
        cleanup,
    } = useRefreshControl(10);

    useEffect(() => cleanup, []);//destroy second plane of the cooldown
    const modalsData = useOrderModals();

   

    /* -------------------------------------------------------------------------- */
    /*                            DATA FETCHING FUNCTIONS                         */
    /* -------------------------------------------------------------------------- */

    const fetchOrders = useCallback(() => {
        setLoading(true);
        setError(null);
        getPedidosFiltrados(filters)
            .then((data) => {
                setOrders(data);
                loadFilters();
            })
            .catch(() =>
                setError(
                    "No logramos acceder a los pedidos... Intenta de nuevo en un momento"
                )
            )
            .finally(() => setLoading(false));
    }, [filters, loadFilters]);

    /* -------------------------------------------------------------------------- */
    /*                               USER INTERACTION                             */
    /* -------------------------------------------------------------------------- */



    const handleRefresh = useCallback((filtersrefresh: OrderFilters) => {
        wrapRefresh(
            () => getPedidosFiltrados(filtersrefresh).then((data) => setOrders(data)),
            () => setError("Ocurrió un error al cargar los datos...")
        );
    }, [wrapRefresh]);

    const markComment = async (fact_num: number, newComment: string, vendes: string) => {
        try {
            const result = await UpdateComment(fact_num, newComment);

            if (!result.success) {
                if (result.error?.statusCode === 403) {
                    Alert.alert(`Solo el vendedor ${vendes?.trim().toLowerCase()}, puede modificar este pedido.`);
                } else {
                    Alert.alert(`Error: ${result.error?.message || 'Error desconocido'}`);
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error al actualizar el comentario:', error);
            Alert.alert('Ocurrió un error inesperado');
            return false;
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                 USE EFFECTS                                */
    /* -------------------------------------------------------------------------- */


    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    /* -------------------------------------------------------------------------- */
    /*                                   MEMOS                                    */
    /* -------------------------------------------------------------------------- */
    const filteredOrders = useMemo(() => {

        if (!searchText || searchText.length < 4) return orders;

        return orders.filter((order) => {
            const cliente = order.co_cli?.toLowerCase() || "";
            const nombre = order.cli_des?.toLowerCase() || "";
            const numero = order.fact_num?.toString().toLowerCase() || "";

            return (
                cliente.includes(searchText.toLowerCase()) ||
                nombre.includes(searchText.toLowerCase()) ||
                numero.includes(searchText.toLowerCase())
            );
        });
        
    }, [orders, searchText]);

    const { totalOrders, totalUSD } = useMemo(() => {
        const totalUSD = filteredOrders
            .filter((order) => order.anulada !== true)
            .reduce(
                (acc, order) => acc + (parseFloat(order.tot_neto as string) || 0),
                0
            );

        return { totalOrders: filteredOrders.length, totalUSD };
    }, [filteredOrders]);

    const activeFiltersCount =
        Object.values(filters).filter(
            (value) => value !== undefined && value !== ""
        ).length ?? 0;

    /* -------------------------------------------------------------------------- */
    /*                                  RETURN                                    */
    /* -------------------------------------------------------------------------- */
    return {
        orders: filteredOrders, 
        totalOrders,
        totalUSD,
        loading,
 
        error,
        markComment,

        // refresh
        handleRefresh,     
          refreshing,
        canRefresh,
        cooldown,
        fetchOrders,

        // modales
        ...modalsData,

        // filtros
        sellers,
        zones,
        statusList,
        procesadoslist,
        filters,
        setFilters,
        activeFiltersCount,
    };
}
