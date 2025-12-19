import { useRefreshControl } from '@/utils/userRefreshControl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMethodPays, getPaysToAuthorize } from '../services/AuthPaysServices';
import { AuthPay } from '../types/AuthPay';
import { MethodPay } from '../types/MethodPay';

export function useAuthPays(searchText: string) {
  const [pays, setPays] = useState<AuthPay[]>([]);
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
      .filter((d) => d.monedaautorizada === 'VED' && d.autorizadopagar === '1')
      .reduce((acc, item) => acc + parseFloat(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalAutorizadoUSD = useMemo(() => {
    return filteredPays
      .filter((d) => d.monedaautorizada === 'USD' && d.autorizadopagar === '1')
      .reduce((acc, item) => acc + parseFloat(item.montoautorizado), 0);
  }, [filteredPays]);

  const totalDocumentsAuth = useMemo(() => {
    return filteredPays.filter((d) => d.autorizadopagar === '1').length;
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

  return {
    pays,
    filteredPays,
    methods,
    loading,
    totalAutorizadoUSD,
    totalAutorizadoVED,
    totalDocumentsAuth,
    handleRefresh,
    refreshing,
    cooldown,
    canRefresh,
    error,
  };
}