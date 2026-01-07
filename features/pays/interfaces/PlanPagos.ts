import { PlanPagosBase } from "./PlanPasgosBase";

// MYSQL
export interface PlanPagos extends PlanPagosBase {
    planpagonumero: number;
    autorizadonumero: number;
    codigobanco?: string | null;
    codigoswift?: string | null;
    metodopago?: string | null;
    fechaautorizadopor?: Date | null;
    autorizadopor?: string | null;
    tasaautorizada?: number | null;
    montoautorizado?: string | null;
    monedaautorizada?: string | null;
    empresapagadora?: string | null;
    pagado: boolean;
    fechapagado?: Date | null;
    bancopagador: string;
    codigounico: number;
    generadotxt: boolean;
    enviadocajachica: boolean;
    conciliadopago: boolean;
    cob_num: number;
    moneda_pago?: string | null;
    monto_pago: number;
    cantidadSKU?: number | null;
    unidades?: number | null;
    origen?: string | null;
    numeroPOOdoo?: string | null;
    linkseleccion?: string | null;
    categoria?: string | null;
    temporada?: string | null;
    estatuscompras?: string | null;
    fechacompras?: Date | null;
    estatuslogistico?: string | null;
    fechalogistico?: Date | null;
}

