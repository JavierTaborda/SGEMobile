import { safeHaptic } from '@/utils/safeHaptics';
import { useRefreshControl } from '@/utils/userRefreshControl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupAuthorizedPays } from '../helpers/groupAuthorizedPays';
import { MethodPay } from '../interfaces/MethodPay';
import { PlanPagos } from '../interfaces/PlanPagos';
import { getMethodPays, getPaysToAuthorize } from '../services/AuthPaysServices';

export function useAuthPays(searchText: string) {
  const [pays, setPays] = useState<PlanPagos[]>([]);
  const [methods, setMethods] = useState<MethodPay[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const { refreshing, canRefresh, cooldown, wrapRefresh, cleanup } = useRefreshControl(15);

  useEffect(() => cleanup, []);

  // dynamic filter
  const filteredPays = useMemo(() => {
    return pays.filter((item) =>
      `${item.observacion} ${item.beneficiario}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [pays, searchText]);

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

  // Refresh
  const handleRefresh = useCallback(() => {
    wrapRefresh(
      async () => {
        const data = await getPaysToAuthorize();
        setPays(data);
      },
      () => setError("Ocurrió un error al cargar los datos...")
    );
  }, [wrapRefresh]);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [paysData, methodsData] = await Promise.all([
        getPaysToAuthorize(),
        getMethodPays(),
      ]);


      setPays(paysData);
      setMethods(methodsData);
    } catch (err) {

      setError("Ocurrió un error al cargar los datos.");
    } finally {

      setLoading(false);

    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyAuthorizationUpdate = useCallback(
    (updatedDocuments: PlanPagos[]) => {
      setPays((prevPays) => {
        const updatedMap = new Map(
          updatedDocuments.map((d) => [d.numerodocumento, d])
        );

        return prevPays.map((item) => {
          const updated = updatedMap.get(item.numerodocumento);
          return updated ? { ...item, ...updated } : item;
        });
      });
    },
    []
  );

  const authorizedData = useMemo(() => {
    return groupAuthorizedPays(
      filteredPays.filter((d) => d.autorizadopagar === 1)
    );
  }, [filteredPays]);

  /*MODALS*/
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [authSelectModalVisible, setAuthSelectModalVisible] = useState(false);

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
  }, [selectionMode, selectedIds.size, totalDocumentsAuth]);


  /*HANDLERS */

  const handleAuthorize = useCallback(() => {
    setAuthSelectModalVisible(true);
  }, []);
const udapteDocuments = async (documents: PlanPagos[]) => {


  applyAuthorizationUpdate(documents);
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
    applyAuthorizationUpdate,
    authorizedData,
    filterModalVisible,
    setFilterModalVisible,
    authSelectModalVisible,
    setAuthSelectModalVisible,
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

  };
}