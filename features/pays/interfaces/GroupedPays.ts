import { PlanPagos } from "./PlanPagos";

export interface GroupedPays {
    [empresa: string]: {
        [claseGasto: string]: {
            [moneda: string]: {
                total: number;
                items: PlanPagos[];
            };
        };
    };
}
