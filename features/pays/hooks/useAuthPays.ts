import { safeHaptic } from "@/utils/safeHaptics";
import { useRefreshControl } from "@/utils/userRefreshControl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { groupAuthorizedPays } from "../helpers/groupAuthorizedPays";
import { CreatePlanResponse } from "../interfaces/CreatePlanResponse";
import { MethodPay } from "../interfaces/MethodPay";
import { PlanificacionPago } from "../interfaces/PlanificacionPagos";
import { PlanPagos } from "../interfaces/PlanPagos";
import {
  createPlan,
  getMethodPays,
  getPaysToAuthorize,
} from "../services/AuthPaysServices";
import { useAuthPaysStore } from "../stores/useAuthPaysStore";
import { FilterData, SelectedFilters } from "../types/Filters";

export function useAuthPays(searchText: string) {
  const pays = useAuthPaysStore((s) => s.pays);
  const setPays = useAuthPaysStore((s) => s.setPays);
  const updatePays = useAuthPaysStore((s) => s.updatePays);
  const lastSync = useAuthPaysStore((s) => s.lastSync);

  const [methods, setMethods] = useState<MethodPay[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  //Filters

  const [filterData, setFilterData] = useState<FilterData>({
    claseGasto: [],
    tipoProveedor: [],
    company: [],
    unidad: [],
    beneficiario: [],
    currency: [],
    status: [],
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    selectedClaseGasto: "",
    selectedTipoProveedor: "",
    selectedCompany: "",
    selectedUnidad: "",
    selectedBeneficiario: "",
    selectedCurrency: "",
    selectedStatus: "",
  });

  const [error, setError] = useState<string | null>(null);

  const { refreshing, canRefresh, cooldown, wrapRefresh, cleanup } =
    useRefreshControl(15);

  useEffect(() => cleanup, []);

  const isCacheExpired = useMemo(() => {
    if (!lastSync) return true;
    const diff = Date.now() - lastSync;
    return diff > 15 * 60 * 1000; // 15 minutes
  }, [lastSync]);

  // dynamic filter
  const filteredPays = useMemo(() => {
    return pays.filter((item) => {
      // by text
      const matchesSearch = `${item.observacion} ${item.beneficiario}`
        .toLowerCase()
        .includes(searchText.toLowerCase());

      // only is if not empty
      const matchesClaseGasto =
        !selectedFilters.selectedClaseGasto ||
        item.clasegasto === selectedFilters.selectedClaseGasto;

      const matchesTipoProveedor =
        !selectedFilters.selectedTipoProveedor ||
        item.tipoproveedor === selectedFilters.selectedTipoProveedor;

      const matchesCompany =
        !selectedFilters.selectedCompany ||
        item.empresa === selectedFilters.selectedCompany;

      const matchesUnidad =
        !selectedFilters.selectedUnidad ||
        item.unidad === selectedFilters.selectedUnidad;

      const matchesBeneficiario =
        !selectedFilters.selectedBeneficiario ||
        item.beneficiario === selectedFilters.selectedBeneficiario;

      const matchesCurrency =
        !selectedFilters.selectedCurrency ||
        item.moneda === selectedFilters.selectedCurrency;

      const matchesStatus = () => {
        switch (selectedFilters.selectedStatus) {
          case "SIN AUTORIZAR":
            return item.autorizadopagar === 0;
          case "AUTORIZADOS":
            return item.autorizadopagar === 1;
          case "TODOS":
          case "":
          case null:
            return true;
          default:
            return true;
        }
      };

      return (
        matchesSearch &&
        matchesClaseGasto &&
        matchesTipoProveedor &&
        matchesCompany &&
        matchesUnidad &&
        matchesBeneficiario &&
        matchesCurrency &&
        matchesStatus()
      );
    });
  }, [pays, searchText, selectedFilters]);

  const totalAutorizadoVED = useMemo(() => {
    return filteredPays
      .filter((d) => d.monedaautorizada === "VED" && d.autorizadopagar === 1)
      .reduce((acc, item) => acc + Number(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalAutorizadoUSD = useMemo(() => {
    return filteredPays
      .filter((d) => d.monedaautorizada === "USD" && d.autorizadopagar === 1)
      .reduce((acc, item) => acc + Number(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalDocumentsAuth = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === 1).length;
  }, [filteredPays]);

  const totalDocumentsUnAuth = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === 0).length;
  }, [filteredPays]);

  const appliedFiltersCount = useMemo(() => {
    return Object.values(selectedFilters).filter(
      (value) => value && value !== "",
    ).length;
  }, [selectedFilters]);

  // Refresh
  const handleRefresh = useCallback(() => {
    wrapRefresh(
      async () => {
        Alert.alert(
          "Actualizar documentos ",

          "Al refrescar los datos se eliminaran los caambios aplicados. ¿Desea continuar?",
          [
            {
              text: "No, quiero mantener cambios.",
              style: "cancel",
            },
            {
              text: "Si, actualizar documentos.",
              style: "destructive",
              onPress: async () => {
                await refreshData();
              },
            },
          ],
          { cancelable: true },
        );

        const methodsData = await getMethodPays();
        setMethods(methodsData);
      },
      () => setError("Ocurrió un error al cargar los datos..."),
    );
  }, [wrapRefresh]);

  const refreshData = async () => {
    try {
      const [paysData, methodsData] = await Promise.all([
        getPaysToAuthorize(),
        getMethodPays(),
      ]);
      setPays(paysData);
      setMethods(methodsData);

      buildFilters(paysData);
    } catch (err) {
      setError("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setError(null);
    if (pays.length === 0) {
      await refreshData();
      return;
    }
    if (!isCacheExpired) {
      Alert.alert(
        "Documentos en caché disponibles",
        "Hay documentos sincronizados recientemente. ¿Desea mantenerlos o actualizar a los más recientes? Se perderán los cambios no guardados.",
        [
          {
            text: "Mantener",
            style: "cancel",
            onPress: () => {
              buildFilters(pays);
              setLoading(false);
            },
          },
          {
            text: "Actualizar",
            style: "destructive",
            onPress: async () => {
              await refreshData();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }

    await refreshData();
    buildFilters(pays);
    setLoading(false);
  }, [isCacheExpired]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      hasLoadedRef.current = false;
    };
  }, []);

  const buildFilters = (data: PlanPagos[]) => {
    setFilterData({
      claseGasto: [...new Set(data.map((d) => d.clasegasto ?? ""))],
      tipoProveedor: [...new Set(data.map((d) => d.tipoproveedor ?? ""))],
      company: [...new Set(data.map((d) => d.empresa ?? ""))],
      unidad: [...new Set(data.map((d) => d.unidad ?? ""))],
      beneficiario: [...new Set(data.map((d) => d.beneficiario ?? ""))],
      currency: [...new Set(data.map((d) => d.moneda ?? ""))],
      status: ["SIN AUTORIZAR", "AUTORIZADOS", "TODOS"],
    });
  };

  const authorizedData = useMemo(() => {
    return groupAuthorizedPays(
      //TODO: mostrar o no
      // filteredPays.filter((d) => d.autorizadopagar === 1 && !d.planpagonumero),
      filteredPays.filter((d) => d.autorizadopagar === 1 && !d.planpagonumero),
    );
  }, [filteredPays]);

  /*MODALS*/
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [authSelectModalVisible, setAuthSelectModalVisible] = useState(false);
  const [createPlanModaleVisible, setCreatePlanModaleVisible] = useState(false);

  /*selection mode */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    [filteredPays, selectedIds],
  );

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
  /* HEADER TEXT */
  const headerTitle = useMemo(() => {
    if (!selectionMode) return `${filteredPays.length} documentos`;
    return `${selectedIds.size}/${filteredPays.length} documentos`;
  }, [selectionMode, selectedIds.size, totalDocumentsAuth, filteredPays]);

  /*HANDLERS */

  const handleAuthorize = useCallback(() => {
    setAuthSelectModalVisible(true);
  }, []);
  const udapteDocuments = async (documents: PlanPagos[]) => {
    updatePays(documents);
    setAuthSelectModalVisible(false);

    requestAnimationFrame(() => {
      exitSelectionMode();
    });
  };
  const createPlanPago = async (
    documents: PlanificacionPago,
  ): Promise<CreatePlanResponse> => {
    try {
      const result = await createPlan(documents);
      if (result.success) {
        applyPlanToDocuments(result.planpagonumero, documents.items);
      }
      return result;
    } catch (err) {
      setError("Ocurrió un error al cargar los datos.");
      throw err;
    }
  };
  const applyPlanToDocuments = useCallback(
    (planNumber: number, docs: PlanPagos[]) => {
      const updated = docs.map((doc) => ({
        ...doc,
        planpagonumero: planNumber,
      }));

      updatePays(updated);
    },
    [updatePays],
  );

  return {
    pays,
    filteredPays,
    methods,
    loading,
    totalAutorizadoUSD,
    totalAutorizadoVED,
    totalDocumentsAuth,
    totalDocumentsUnAuth,
    handleRefresh,
    refreshing,
    cooldown,
    canRefresh,
    error,
    authorizedData,
    refreshData,
    //Modals
    createPlanModaleVisible,
    setCreatePlanModaleVisible,
    filterModalVisible,
    setFilterModalVisible,
    authSelectModalVisible,
    setAuthSelectModalVisible,

    //Select mode
    selectionMode,
    setSelectionMode,
    selectedIds,
    setSelectedIds,
    exitSelectionMode,
    enterSelectionMode,
    selectedItems,
    headerTitle,
    handleAuthorize,
    udapteDocuments,
    toggleSelect,

    //filters
    filterData,
    selectedFilters,
    setSelectedFilters,
    appliedFiltersCount,

    createPlanPago,
    applyPlanToDocuments,
  };
}
