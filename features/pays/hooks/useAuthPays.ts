import { useAuthStore } from "@/stores/useAuthStore";
import { safeHaptic } from "@/utils/safeHaptics";
import { useRefreshControl } from "@/utils/userRefreshControl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { groupAuthorizedPays } from "../helpers/groupAuthorizedPays";
import { CreatePlanResponse } from "../interfaces/CreatePlanResponse";
import { MethodPay } from "../interfaces/MethodPay";
import { PlanificacionPago } from "../interfaces/PlanificacionPagos";
import { PlanPagos } from "../interfaces/PlanPagos";
import { CodeSwift } from "../interfaces/SwiftCode";
import {
  authDocuments,
  createPlan,
  getMethodPays,
  getPaysToAuthorize,
  getSwiftCodes
} from "../services/AuthPaysServices";
import { useAuthPaysStore } from "../stores/useAuthPaysStore";
import { FilterData, SelectedFilters } from "../types/Filters";
import { ResultPostAuth, ResultPostPlan } from "../types/ResultPosts";

export function useAuthPays(searchText: string) {
  const pays = useAuthPaysStore((s) => s.pays);
  const setPays = useAuthPaysStore((s) => s.setPays);
  const updatePays = useAuthPaysStore((s) => s.updatePays);
  const lastSync = useAuthPaysStore((s) => s.lastSync);

  const [methods, setMethods] = useState<MethodPay[]>([]);
  const [swiftCode, setSwiftCode] = useState<CodeSwift[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const { name } = useAuthStore();

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
      const matchesSearch = `${item.observacion} ${item.beneficiario} ${item.tipodocumento}-${item.numerodocumento}`
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
  const totalDocumentsPlan = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === 1 && !d.planpagonumero).length;
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
        // Alert.alert(
        //   "Actualizar documentos ",

        //   "Al refrescar los datos se eliminaran los caambios aplicados. ¿Desea continuar?",
        //   [
        //     {
        //       text: "No, quiero mantener cambios.",
        //       style: "cancel",
        //     },
        //     {
        //       text: "Si, actualizar documentos.",
        //       style: "destructive",
        //       onPress: async () => {
        //         await refreshData();
        //       },
        //     },
        //   ],
        //   { cancelable: true },
        // );

        refreshData()
      },
      () => setError("Ocurrió un error al cargar los datos..."),
    );
  }, [wrapRefresh]);

  const refreshData = async () => {
    try {
      const [paysData, methodsData, swiftCode] = await Promise.all([
        getPaysToAuthorize(),
        getMethodPays(),
        getSwiftCodes(),
      ]);
      setPays(paysData);
      setMethods(methodsData);
      setSwiftCode(swiftCode)


      buildFilters(paysData);
      setError("")
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
    
    //to save documents in cache uncomment this
    // if (pays.length === 0) {
    //   await refreshData();
    //   return;
    // }



    // if (!isCacheExpired) {
    //   Alert.alert(
    //     "Documentos en caché disponibles",
    //     "Hay documentos sincronizados recientemente. ¿Desea mantenerlos o actualizar a los más recientes? Se perderán los cambios no guardados.",
    //     [
    //       {
    //         text: "Mantener",
    //         style: "cancel",
    //         onPress: () => {
    //           buildFilters(pays);
    //           setLoading(false);
    //         },
    //       },
    //       {
    //         text: "Actualizar",
    //         style: "destructive",
    //         onPress: async () => {
    //           await refreshData();
    //         },
    //       },
    //     ],
    //     { cancelable: true },
    //   );
    //   return;
    // }

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


    const result: ResultPostAuth = await authDocuments(documents)

    if (result.success) {
      updatePays(documents);

      setAuthSelectModalVisible(false);
      exitSelectionMode();
    }
    return result
  };
  const createPlanPago = async (
    planToCreate: PlanificacionPago,
  ): Promise<CreatePlanResponse> => {
    try {


      const planFinal: PlanificacionPago = {
        ...planToCreate,
        owneruser: planToCreate.items[0].owneruser,
        autorizadopor: name,
        fechaautorizadopor: new Date()
        // ...totals 
      }


      const result: ResultPostPlan = await createPlan(planFinal);

      if (result.success) {
        applyPlanToDocuments(result.planpagonumero, planFinal.items);
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

  //Build auth documents 

  function buildAuthorizedItems(
    items: PlanPagos[],
    currency: string,
    rate: number,
    customAmount?: number,
    selectedMethod?: MethodPay,
  ): PlanPagos[] {

    const now = new Date();



    return items.map((item, index) => {
      let montoautorizado =
        currency === "USD"
          ? Number(item.montoneto) / (item.moneda === "USD" ? 1 : rate)
          : Number(item.montoneto) * (item.moneda === "USD" ? rate : 1);

      if (index === 0 && customAmount && customAmount > 0) {
        montoautorizado = customAmount;
      }
      const metodo = currency === "USD" ? "DOLARES" : "BOLIVARES";

      const titularCuenta = item.titularcuenta || item.beneficiario;
      const codebank = item.cuentabanco?.slice(0, 4);
      const swift = swiftCode.find((s => s.codigobanco === codebank))?.codigoswift


      return {
        ...item,
        monedaautorizada: currency,
        tasaautorizada: rate,
        montoautorizado,
        autorizadopagar: 1,
        metodopago: metodo,
        empresapagadora: selectedMethod?.empresapagadora ?? "",
        bancopagador: selectedMethod?.bancopago ?? "",
        codigounico: selectedMethod?.codigounico ?? 0,
        fechaautorizadopor: now,
        autorizadopor: name,
        titularcuenta: titularCuenta,
        codigoswift: swift,
        codigobanco: codebank,
        planpagonumero: 0,
        autorizadonumero: 0,
        pagado: false,
        fechapagado: null,

        generadotxt: false,
        enviadocajachica: false,
        conciliadopago: false,
      };
    });
  }
  function buildUnAuthorizedItems(items: PlanPagos[]): PlanPagos[] {
    return items.map((item) => ({
      ...item,
      autorizadopagar: 0,
      monedaautorizada: null,
      tasaautorizada: 0,
      montoautorizado: 0,
      metodopago: "",
      empresapagadora: "",
      bancopagador: "",
      planpagonumero: 0,
      autorizadonumero: 0,
      codigounico: 0,
      autorizadopor: "",
      fechaautorizadopor: null,

    }));
  }


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
    totalDocumentsPlan,
    loadData,
    buildAuthorizedItems,
    buildUnAuthorizedItems
  };
}
