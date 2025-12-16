import { OrderApproval } from "../types/OrderApproval";
import { OrderFilters } from "../types/OrderFilters";

// change to date format
function parseFecha(fecha: string): Date {
    return new Date(fecha.replace(" ", "T").split(".")[0]);
}

function matchesDate(order: OrderApproval, filters: OrderFilters): boolean {
    const fechaPedido = parseFecha(order.fec_emis);
    if (filters.startDate && fechaPedido < filters.startDate) return false;
    if (filters.endDate && fechaPedido > filters.endDate) return false;
    return true;
}

function matchesStatus(order: OrderApproval, filters: OrderFilters): boolean {
    if (!filters.status) return true;

    return String(order.revisado) === filters.status;
}
function matchesProcesado(order: OrderApproval, filters: OrderFilters): boolean {
    if (!filters.procesado) return true;

    return String(order.estatus) === filters.procesado;
}
function matchesAnulado(order: OrderApproval, filters: OrderFilters): boolean {
    if (filters.cancelled === undefined) return true; 

    if (filters.cancelled) {
        return order.anulada === 1; 
    }

    return order.anulada !== 1; 
}


function matchesSeller(order: OrderApproval, filters: OrderFilters): boolean {
    if (filters.seller === 'TODOS'|| !filters.seller) return true
    return   order.ven_des.trim() === filters.seller;
}

function matchesZone(order: OrderApproval, filters: OrderFilters): boolean {
    if (filters.zone === 'TODOS' || !filters.zone) return true
    return order.zon_des.trim() === filters.zone;
}

function matchesText(order: OrderApproval, searchText: string): boolean {
    const search = searchText.toLowerCase().trim();
    const cliente = order.cli_des?.toLowerCase() || "";
    const factura = order.fact_num?.toString() || "";
    return cliente.includes(search) || factura.includes(search);
}

export function applyOrderFilters(
    orders: OrderApproval[],
    filters: OrderFilters,
    searchText: string
): OrderApproval[] {
    return orders.filter(order =>
        matchesDate(order, filters) &&
        matchesStatus(order, filters) &&
        matchesProcesado(order, filters) &&
        matchesAnulado(order, filters) &&
        matchesSeller(order, filters) &&
        matchesZone(order, filters) &&
        matchesText(order, searchText)
    );
}