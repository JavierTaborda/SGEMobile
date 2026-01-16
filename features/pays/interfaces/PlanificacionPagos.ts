import { PlanPagos } from "./PlanPagos";

export interface PlanificacionPago {
    descripcion: string;
    date: Date;
    items: PlanPagos[];
}