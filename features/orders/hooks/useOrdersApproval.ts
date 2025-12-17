import { emojis } from "@/utils/emojis";
import { useRefreshControl } from "@/utils/userRefreshControl";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import {
  changeRevisado,
  getOrdersToApproval,
  getPedidosFiltrados
} from "../services/OrderService";
import { OrderApproval } from "../types/OrderApproval";
import { applyOrderFilters } from "../utils/applyOrderFilters";
import { useOrderFilters } from "./useOrderFilters";
import { useOrderModals } from "./useOrderModals";

export function useOrderApproval(searchText: string) {
  /* -------------------------------------------------------------------------- */
  /*                                                            */
  /* -------------------------------------------------------------------------- */
  const [ordersAproval, setOrdersAproval] = useState<OrderApproval[]>([]);
  const [orders, setOrders] = useState<OrderApproval[]>([]); // uso local con JSON
  const [loading, setLoading] = useState(true);
  //const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // // control de cooldown
  const {
    refreshing,
    canRefresh,
    cooldown,
    wrapRefresh,
    cleanup,
  } = useRefreshControl(15);

  useEffect(() => cleanup, []);//destroy second plane of the cooldown

  // const [canRefresh, setCanRefresh] = useState(true);
  // const [cooldown, setCooldown] = useState(0);
  // const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sortDate, setSortDate] = useState(false);
  const [sortMount, setSortMount] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [mountRange, setMountRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [mountRangeActive, setMountRangeActive] = useState(false);


  const { filters, loadFilters, sellers, zones, statusList, procesadoslist, setFilters, } = useOrderFilters();

  const modalsData = useOrderModals();


  /* -------------------------------------------------------------------------- */
  /*                               UTILS - HELPERS                              */
  /* -------------------------------------------------------------------------- */
  // function startCooldown(seconds: number) {
  //   setCooldown(seconds);

  //   function tick() {
  //     setCooldown((prev) => {
  //       if (prev <= 1) {
  //         if (timeoutRef.current) {
  //           clearTimeout(timeoutRef.current);
  //           timeoutRef.current = null;
  //         }
  //         return 0;
  //       }
  //       timeoutRef.current = setTimeout(tick, 1000);
  //       return prev - 1;
  //     });
  //   }

  //   timeoutRef.current = setTimeout(tick, 1000);
  // }

  /* -------------------------------------------------------------------------- */
  /*                            DATA FETCHING FUNCTIONS                         */
  /* -------------------------------------------------------------------------- */


  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);

    getOrdersToApproval()
      .then((data) => {
        setOrdersAproval(data);
        loadFilters();
      })
      .catch(() =>
        setError("No logramos acceder a los pedidos... Intenta de nuevo en un momento")
      )
      .finally(() => setLoading(false));
  }, [loadFilters]);

  const getOrders = useCallback(() => {
    setLoading(true);
    setError(null);


    getPedidosFiltrados(filters)
      .then((data) => {
        setOrders(data);
        loadFilters();
      })
      .catch(() =>
        setError("No logramos acceder a los pedidos... Intenta de nuevo en un momento")
      )
      .finally(() => setLoading(false));
  }, [filters, loadFilters]);

  /* -------------------------------------------------------------------------- */
  /*                               USER INTERACTION                             */
  /* -------------------------------------------------------------------------- */


  const handleRefresh = useCallback(() => {

    wrapRefresh(() =>
      getOrdersToApproval()
        .then((data) => setOrdersAproval(data)),
      () => setError("Ocurrió un error al cargar los datos...")

    );
  }, [wrapRefresh]);

  const handleChangeRevisado = async (fact_num: number, newStatus: string) => {
    try {
      if (newStatus !== "1" && newStatus !== " ") {
        throw new Error('Estado inválido. Usa "1" para Revisado o " " para Por Revisar.');
      }

      const response = await changeRevisado(fact_num, newStatus);
      if (response.success) {
        setOrdersAproval((prev) =>
          prev.map((order) =>
            order.fact_num === fact_num ? { ...order, revisado: newStatus } : order
          )
        );

        const msg =
          newStatus === "1"
            ? `Pedido ${fact_num} marcado como Revisado`
            : `Pedido ${fact_num} marcado como Por Revisar`;



        Platform.OS === "android"
          ? ToastAndroid.show(msg, ToastAndroid.SHORT)
          : Alert.alert(`${emojis.approved} Estado actualizado`, msg);
      }
    } catch (error) {
      const errorMsg = `Error al actualizar el pedido ${fact_num}: ${error}`;
      Platform.OS === "android"
        ? ToastAndroid.show(errorMsg, ToastAndroid.LONG)
        : Alert.alert("Error", errorMsg);
    }
  };


  /* -------------------------------------------------------------------------- */
  /*                                 USE EFFECTS                                */
  /* -------------------------------------------------------------------------- */
  // useEffect(() => {
  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //       timeoutRef.current = null;
  //     }
  //   };
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  useEffect(() => {
    setMountRangeActive(mountRange.min !== null || mountRange.max !== null);
  }, [mountRange]);

  /* -------------------------------------------------------------------------- */
  /*                                   MEMOS                                    */
  /* -------------------------------------------------------------------------- */
  const { filteredOrders, totalOrders, totalUSD } = useMemo(() => {
    let filtered = applyOrderFilters(ordersAproval, filters, searchText);

    if (showStatus) {
      filtered = filtered.filter((order) => order.revisado === " ");
    }

    if (sortDate) {
      filtered.sort((a, b) => new Date(a.fec_emis).getTime() - new Date(b.fec_emis).getTime());
    }

    if (sortMount) {
      filtered.sort((a, b) => {
        const montoA = parseFloat(a.tot_neto as string) || 0;
        const montoB = parseFloat(b.tot_neto as string) || 0;
        return montoB - montoA;
      });
    }

    if (mountRange.min !== null || mountRange.max !== null) {
      filtered = filtered.filter((order) => {
        const monto = parseFloat(order.tot_neto as string) || 0;
        const minOk = mountRange.min !== null ? monto >= mountRange.min : true;
        const maxOk = mountRange.max !== null ? monto <= mountRange.max : true;
        return minOk && maxOk;
      });
    }

    const totalUSD = filtered
      .filter((order) => order.anulada !== true)
      .reduce((acc, order) => acc + (parseFloat(order.tot_neto as string) || 0), 0);

    return { filteredOrders: filtered, totalOrders: filtered.length, totalUSD };
  }, [ordersAproval, searchText, filters, sortDate, sortMount, showStatus, mountRange]);

  const activeFiltersCount =
    Object.values(filters).filter((value) => value !== undefined && value !== "").length ?? 0;

  const maxMonto =
    filteredOrders.length > 0
      ? Math.max(
        ...filteredOrders
          .filter((order) => order.anulada !== true)
          .map((order) => parseFloat(order.tot_neto as string) || 0)
      )
      : 0;



  /* -------------------------------------------------------------------------- */
  /*                                  RETURN                                    */
  /* -------------------------------------------------------------------------- */
  return {
    // orders
    filteredOrders,
    totalOrders,
    totalUSD,
    orders, // JSON local
    loading,
    refreshing,
    error,

    // refresh
    handleRefresh,
    canRefresh,
    cooldown,
    fetchOrders,

    // revisar
    handleChangeRevisado,

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
    sortDate,
    setSortDate,
    sortMount,
    setSortMount,
    showStatus,
    setShowStatus,
    mountRange,
    setMountRange,
    mountRangeActive,
    maxMonto,
  };
}
