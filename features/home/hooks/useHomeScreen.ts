import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanySummary } from "../interfaces/CommpanySummary";
import { PieChartData } from "../interfaces/PieChartData";
import { getSummary } from "../services/HomeScreenServices";

export function useHomeScreen() {

  const [summaryData, setSummaryData] = useState<CompanySummary[]>([]);
  const [chartData, setChartData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useHomeScreen.ts
  const colors = ["#EF4444", "#F59E0B", "#4F46E5", "#10B981", "#8B5CF6", "#06B6D4"]; // Paleta de colores para la gráfica
  // useHomeScreen.ts

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response: CompanySummary[] = await getSummary();

   
      const validData = response
        .filter(item => item.totalSaldoUSD > 0)
       // .sort((a, b) => b.totalSaldoUSD - a.totalSaldoUSD);

      // Total USD
      const grandTotal = validData.reduce((acc, curr) => acc + curr.totalSaldoUSD, 0);

      const formattedPie = validData.map((item, index) => {
        const percentage = grandTotal > 0
          ? ((item.totalSaldoUSD / grandTotal) * 100).toFixed(1)
          : "0";

        return {
          value: item.totalSaldoUSD,
          color: colors[index % colors.length],
          text: item.empresa,
          percentage: `${percentage}%`, 
          focused: index === 0,
        };
      });
      setSummaryData(response);
      setChartData(formattedPie);
    } catch (err) {
      setError("Error calculando datos");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //  InfoCards
  const totals = useMemo(() => {
    const totalNeto = summaryData.reduce((acc, p) => acc + (Number(p.totalNetoUSD) || 0), 0);
    const totalSaldo = summaryData.reduce((acc, curr) => acc + curr.totalSaldoUSD, 0);
    const totalSaldoBs = summaryData.reduce((acc, curr) => acc + curr.totalSaldoVED, 0);
    return { totalNeto, totalSaldo, totalSaldoBs, totalCount: summaryData.reduce((acc, curr) => acc + (curr.cantidadDocs || 0), 0) };
  }, [ summaryData]);

  return { ...totals, summaryData, chartData, loading, error, fetchData };
}