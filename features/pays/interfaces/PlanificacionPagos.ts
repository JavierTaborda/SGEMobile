import { PlanPagos } from "./PlanPagos";

export interface PlanificacionPago {
  items: PlanPagos[];

  planpagonumero: number;
  unidad: string;
  empresa: string;
  fechapagoautorizada: Date;
  descripcionplan: string;
  fechaautorizadopor?: Date | null;
  autorizadopor?: string | null;
  totalnetobsd: number;
  totalnetousd: number;
  totalsaldobsd: number;
  totalsaldousd: number;
  totalautorizadobsd: number;
  totalautorizadousd: number;
  totalpagadobsd: number;
  totalpagadousd: number;
  totalxpagarbsd: number;
  totalxpagarusd: number;
  generadotxt: boolean;
  conciliadopago: boolean;
  owneruser: number;
}
