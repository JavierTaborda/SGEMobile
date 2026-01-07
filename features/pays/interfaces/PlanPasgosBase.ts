// SQL
export interface PlanPagosBase {
    unidad: string;
    empresa: string;
    tipodocumento: string;
    numerodocumento: number;
    codigobeneficiario?: string | null;
    beneficiario: string;
    titularcuenta?: string | null;
    cuentabanco?: string | null;
    banco?: string | null;
    rifproveedor: string;
    tipoproveedor: string;
    autorizadopagar: string;
    registradopor: string;
    fechaemision: string | Date;
    fechavencimiento: string | Date;
    fecharegistro: string | Date;
    numerofactura: string | number;
    observacion?: string | null;
    tasacambio: string | number;
    moneda: string;
    montoneto: string | number;
    montosaldo: string | number;
    monedaproveedor?: string | null;
    tipocuenta?: string | null;
    clasegasto?: string | null;
    origenhes: number | boolean;
    linkproforma?: string | null;
    owneruser: number;
    // campos extras que solo existen en origen
    profite?: string;
    planificado?: string;
    keyfile?: number;
}