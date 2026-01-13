

export interface PlanPagos  {
    //SQl
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
    autorizadopagar: number;
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
    //Mysql

    planpagonumero: number;
    autorizadonumero: number;
    codigobanco?: string | null;
    codigoswift?: string | null;
    metodopago?: string | null;
    fechaautorizadopor?: Date | null;
    autorizadopor?: string | null;
    tasaautorizada?: number | null;
    montoautorizado?: number | null;
    monedaautorizada?: string | null;
    empresapagadora?: string | null;
    pagado: number;
    fechapagado?: Date | null;
    bancopagador: string;
    codigounico: number;
    generadotxt: number;
    enviadocajachica: number;
    conciliadopago: number;
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

