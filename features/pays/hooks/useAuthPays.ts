import { safeHaptic } from '@/utils/safeHaptics';
import { useRefreshControl } from '@/utils/userRefreshControl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { groupAuthorizedPays } from '../helpers/groupAuthorizedPays';
import { MethodPay } from '../interfaces/MethodPay';
import { PlanPagos } from '../interfaces/PlanPagos';
import { getMethodPays, getPaysToAuthorize } from '../services/AuthPaysServices';
import { useAuthPaysStore } from '../stores/useAuthPaysStore';
import { FilterData, SelectedFilters } from '../types/Filters';

export function useAuthPays(searchText: string) {
  const pays = useAuthPaysStore((s) => s.pays);
  const setPays = useAuthPaysStore((s) => s.setPays);
  const updatePays = useAuthPaysStore((s) => s.updatePays);
  const lastSync = useAuthPaysStore((s) => s.lastSync);

  const [methods, setMethods] = useState<MethodPay[]>([]);
  const [loading, setLoading] = useState(true);



  //Filters

  const [filterData, setFilterData] = useState<FilterData>({
    claseGasto: [],
    tipoProveedor: [],
    company: [],
    unidad: [],
    beneficiario: [],
    currency: [],
    status: []
  })
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    selectedClaseGasto: '',
    selectedTipoProveedor: '',
    selectedCompany: '',
    selectedUnidad: '',
    selectedBeneficiario: '',
    selectedCurrency: '',
    selectedStatus: '',
  });

  const [error, setError] = useState<string | null>(null);

  const { refreshing, canRefresh, cooldown, wrapRefresh, cleanup } = useRefreshControl(15);

  useEffect(() => cleanup, []);

  const isCacheExpired = useMemo(() => {
    if (!lastSync) return true;
    const diff = Date.now() - lastSync;
    return diff > 30 * 60 * 1000; // 30 minutes
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
      }

      return (
        matchesSearch &&
        matchesClaseGasto &&
        matchesTipoProveedor &&
        matchesCompany &&
        matchesUnidad &&
        matchesBeneficiario &&
        matchesCurrency && matchesStatus()
      );
    });
  }, [pays, searchText, selectedFilters]);

  const totalAutorizadoVED = useMemo(() => {
    return filteredPays
      .filter((d) => d.monedaautorizada === 'VED' && d.autorizadopagar === 1)
      .reduce((acc, item) => acc + Number(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalAutorizadoUSD = useMemo(() => {
    return filteredPays
      .filter((d) => d.monedaautorizada === 'USD' && d.autorizadopagar === 1)
      .reduce((acc, item) => acc + Number(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalDocumentsAuth = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === 1).length;
  }, [filteredPays]);

  const totalDocumentsUnAuth = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === 0).length;
  }, [filteredPays]);


  const appliedFiltersCount = useMemo(() => {
    return Object.values(selectedFilters).filter((value) => value && value !== '').length;
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
          { cancelable: true }
        );
   

      },
      () => setError("Ocurrió un error al cargar los datos...")
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
    setError(null);

    if (pays.length > 0) {
      if (!isCacheExpired) {

        Alert.alert(
          "Documentos en caché disponibles",
          "hay documentos actualizados con menos de 30 minutos de sincronización. ¿Desea mantener estos documentos o actualizar a los mas recientes. Se perderan los datos no guardados.?",
          [
            {
              text: "Mantener ",
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
          { cancelable: true }
        );
      } else {
        await refreshData();
        const methodsData = await getMethodPays();
        setMethods(methodsData);
        buildFilters(pays);
        setLoading(false);
      }
      return;
    }


  }, [isCacheExpired]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const buildFilters = (data: PlanPagos[]) => {
    setFilterData({
      claseGasto: [...new Set(data.map(d => d.clasegasto ?? ""))],
      tipoProveedor: [...new Set(data.map(d => d.tipoproveedor ?? ""))],
      company: [...new Set(data.map(d => d.empresa ?? ""))],
      unidad: [...new Set(data.map(d => d.unidad ?? ""))],
      beneficiario: [...new Set(data.map(d => d.beneficiario ?? ""))],
      currency: [...new Set(data.map(d => d.moneda ?? ""))],
      status: ["SIN AUTORIZAR", "AUTORIZADOS", "TODOS"],
    });
  };


  // const loadData = useCallback(async () => {
  //   try {
  //     setError(null);

  //     if (hasCache) {
  //       const methodsData = await getMethodPays()
  //       setMethods(methodsData);
  //       //Filters
  //       buildFilters(pays);
  //       setLoading(false);
  //       return;
  //     }

  //     const [paysData, methodsData] = await Promise.all([
  //       getPaysToAuthorize(),
  //       getMethodPays(),
  //     ]);


  //     setPays(paysData);
  //     setMethods(methodsData);

  //     //Filters
  //     buildFilters(paysData);


  //   } catch (err) {

  //     setError("Ocurrió un error al cargar los datos.");
  //   } finally {

  //     setLoading(false);

  //   }
  // }, []);

  // const buildFilters = (data: PlanPagos[]) => {
  //   setFilterData({
  //     claseGasto: [...new Set(data.map(d => d.clasegasto ?? ""))],
  //     tipoProveedor: [...new Set(data.map(d => d.tipoproveedor ?? ""))],
  //     company: [...new Set(data.map(d => d.empresa ?? ""))],
  //     unidad: [...new Set(data.map(d => d.unidad ?? ""))],
  //     beneficiario: [...new Set(data.map(d => d.beneficiario ?? ""))],
  //     currency: [...new Set(data.map(d => d.moneda ?? ""))],
  //     status: ["SIN AUTORIZAR", "AUTORIZADOS", "TODOS"],
  //   });
  // };



  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  // const applyAuthorizationUpdate = useCallback(
  //   (updatedDocuments: PlanPagos[]) => {
  //     setPays((prevPays) => {
  //       const updatedMap = new Map(
  //         updatedDocuments.map((d) => [d.numerodocumento, d])
  //       );

  //       return prevPays.map((item) => {
  //         const updated = updatedMap.get(item.numerodocumento);
  //         return updated ? { ...item, ...updated } : item;
  //       });
  //     });
  //   },
  //   []
  // );

  const authorizedData = useMemo(() => {
    return groupAuthorizedPays(
      filteredPays.filter((d) => d.autorizadopagar === 1)
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
    [filteredPays, selectedIds]
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
    //Modals
    createPlanModaleVisible, setCreatePlanModaleVisible,
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
    selectedFilters, setSelectedFilters,
    appliedFiltersCount

  };
}