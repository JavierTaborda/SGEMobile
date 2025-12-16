
import { useEffect, useState } from 'react';
import { getPaysToAuthorize } from '../services/AuthPaysServices';
import { AuthPay } from '../types/AuthPay';

export function useAuthPays() {
  const [pays, setPays] = useState<AuthPay[]>([]);
  const [loading, setLoading] = useState(true);

  const totalAutorizadoVED = pays
    .filter((d) => d.monedaautorizada === 'VED' && d.autorizadopagar==='1')
    .reduce((acc, item) => acc + parseFloat(item.montoautorizado), 0);

  const totalAutorizadoUSD = pays
    .filter((d) => d.monedaautorizada === 'USD'&& d.autorizadopagar==='1')
    .reduce((acc, item) => acc + parseFloat(item.montoautorizado), 0);


 const totalDocumentsAuth = pays.filter(d => d.autorizadopagar === '1').length;





  useEffect(() => {
    getPaysToAuthorize()
      .then(setPays)
      .catch()
      .finally(() => setLoading(false));
  }, []);

  return { pays, loading, totalAutorizadoUSD, totalAutorizadoVED,totalDocumentsAuth };
}
