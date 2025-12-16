export interface CreateDevolucion {
    fecemis: string;             // Emission date (ISO: YYYY-MM-DDTHH:mm:ss)
    estatus: string;             // Status  (1 )
    anulada: string;             // Canceled flag (0)
    cerrada: string;             // Closed flag (0)
    codcli: string;              // Customer code
    clides: string;              // Customer description/name
    codven: string;              // Salesperson code
    vendes: string;              // Salesperson description/name
    codart: string;              // Product code
    codbarra: string;           // Barcode 
    artdes: string;              // Product description
    serial1: string;             // Product serial number
    motivo: string;             // Return reason 
    obsvendedor?: string;        // Seller comment 
    registradopor: string;       // Registered by (user identifier)
    fecharegistro: string;       // Registration date (ISO)
    imgart?: string;             // Product image URL or path (optional)
}
