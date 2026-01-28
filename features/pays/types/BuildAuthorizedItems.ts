import { MethodPay } from "../interfaces/MethodPay";
import { PlanPagos } from "../interfaces/PlanPagos";


export type BuildAuthorizedItems = (
    items: PlanPagos[],
    currency: string,
    rate: number,
    customAmount?: number,
    selectedMethod?: MethodPay,
) => PlanPagos[];

export type BuildUnAuthorizedItems = (items: PlanPagos[]) => PlanPagos[];