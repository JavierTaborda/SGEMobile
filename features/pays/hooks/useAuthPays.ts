import { useRefreshControl } from '@/utils/userRefreshControl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPaysToAuthorize } from '../services/AuthPaysServices';
import { AuthPay } from '../types/AuthPay';

export function useAuthPays(searchText: string) {
  const [pays, setPays] = useState<AuthPay[]>([]);
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
      () => getPaysToAuthorize().then(setPays),
      () => setError("Ocurrió un error al cargar los datos...")
    );
  }, [wrapRefresh]);

  // Initia
  useEffect(() => {
    getPaysToAuthorize()
      .then(setPays)
      .catch(() => setError("Error inicial"))
      .finally(() => setLoading(false));
  }, []);

  return {
    pays,
    filteredPays,
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