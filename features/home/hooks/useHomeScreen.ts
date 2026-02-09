import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanySummary } from "../interfaces/CommpanySummary";
import { getSummary } from "../services/HomeScreenServices";


export const CHART_COLORS = [
  "#B91C1C",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",

] as const;

export type CurrencyType = "USD" | "VED";

const MAX_CHART_ITEMS = 10;

export function useHomeScreen() {
  const [summaryData, setSummaryData] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyType>("USD");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSummary();
      setSummaryData(response);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Error al cargar los datos";
      setError(errorMessage);
      console.error("Error en fetchData:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const chartData = useMemo(() => {

    const validData = summaryData.filter(item => {
      const value = currency === "USD" ? item.totalSaldoUSD : item.totalSaldoVED;
      return value > 0;
    });

    if (validData.length === 0) return [];


    const sortedData = validData.sort((a, b) => {
      const valueA = currency === "USD" ? a.totalSaldoUSD : a.totalSaldoVED;
      const valueB = currency === "USD" ? b.totalSaldoUSD : b.totalSaldoVED;
      return valueB - valueA;
    });

    // FIRTS 10 COMPANYS
    const topCompanies = sortedData.slice(0, MAX_CHART_ITEMS);

    // OTHER +10
    const hasOthers = sortedData.length > MAX_CHART_ITEMS;
    const finalData = hasOthers ? [...topCompanies] : topCompanies;

    if (hasOthers) {
      const othersData = sortedData.slice(MAX_CHART_ITEMS);
      const othersTotal = othersData.reduce((acc, curr) => {
        return acc + (currency === "USD" ? curr.totalSaldoUSD : curr.totalSaldoVED);
      }, 0);


      finalData.push({
        empresa: `Otros (${othersData.length})`,
        totalSaldoUSD: currency === "USD" ? othersTotal : 0,
        totalSaldoVED: currency === "VED" ? othersTotal : 0,
        cantidadDocs: othersData.reduce((acc, curr) => acc + (curr.cantidadDocs || 0), 0),
        totalNetoUSD: 0,
        totalNetoVED: 0,
      } as CompanySummary);
    }


    const grandTotal = finalData.reduce((acc, curr) => {
      return acc + (currency === "USD" ? curr.totalSaldoUSD : curr.totalSaldoVED);
    }, 0);


    return finalData.map((item, index) => {
      const value = currency === "USD" ? item.totalSaldoUSD : item.totalSaldoVED;
      const percentage = grandTotal > 0
        ? ((value / grandTotal) * 100).toFixed(1)
        : "0";

      return {
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
        text: item.empresa,
        percentage: `${percentage}%`,
        documents:` ${item.cantidadDocs} documento${item.cantidadDocs>1?'s':''}`,
        focused: index === 0,
      };
    });
  }, [summaryData, currency]);


  const totals = useMemo(() => {
    const totalSaldo = summaryData.reduce(
      (acc, curr) => acc + curr.totalSaldoUSD,
      0
    );
    const totalSaldoBs = summaryData.reduce(
      (acc, curr) => acc + curr.totalSaldoVED,
      0
    );
    const totalCount = summaryData.reduce(
      (acc, curr) => acc + (curr.cantidadDocs || 0),
      0
    );

    return { totalSaldo, totalSaldoBs, totalCount };
  }, [summaryData]);

  return {
    ...totals,
    summaryData,
    chartData,
    loading,
    error,
    fetchData,
    currency,
    setCurrency,
  };
}