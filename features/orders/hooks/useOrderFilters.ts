import { useCallback, useState } from "react";
import { getProcesados, getStatus, getVendors, getZones } from "../services/OrderService";
import { OrderFilters, procesadosOptions, statusOptions } from "../types/OrderFilters";

export function useOrderFilters() {
    const [zones, setZones] = useState<string[]>([]);
    const [sellers, setSellers] = useState<string[]>([]);
    const [statusList, setStatusList] = useState<statusOptions[]>([]);
    const [procesadoslist, setProcesadosList] = useState<procesadosOptions[]>([]);
    const [filters, setFilters] = useState<OrderFilters>({});
   

    const loadFilters = useCallback(async () => {
        try {
            const [zonesData, sellersData, statusData, procesadoData] = await Promise.all([
                getZones(),
                getVendors(),
                getStatus(),
                getProcesados(),
            ]);
            setZones(zonesData);
            setSellers(sellersData);
            setStatusList(statusData);
            setProcesadosList(procesadoData);
        } catch (error) {
            console.error("Error cargando filtros:", error);
        }
    }, []);


    const activeFiltersCount =
        Object.values(filters).filter((v) => v !== undefined && v !== "").length ?? 0;

    return {
        zones,
        sellers,
        statusList,
        procesadoslist,
        filters,
        setFilters,
        activeFiltersCount,
        loadFilters,
    };
}
