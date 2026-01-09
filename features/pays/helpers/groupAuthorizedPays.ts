import { GroupedPays } from "../interfaces/GroupedPays";
import { PlanPagos } from "../interfaces/PlanPagos";

export function groupAuthorizedPays(data: PlanPagos[]): GroupedPays {
    return data.reduce<GroupedPays>((acc, item) => {
        const empresa = item.empresa ?? "Sin empresa";
        const clase = item.clasegasto ?? "Sin clase";
        const moneda = item.monedaautorizada ?? "N/A";
        const monto = item.montoautorizado ?? 0;

        if (!acc[empresa]) acc[empresa] = {};
        if (!acc[empresa][clase]) acc[empresa][clase] = {};
        if (!acc[empresa][clase][moneda]) {
            acc[empresa][clase][moneda] = { total: 0, items: [] };
        }

        acc[empresa][clase][moneda].items.push(item);
        acc[empresa][clase][moneda].total += monto;

        return acc;
    }, {});
}
