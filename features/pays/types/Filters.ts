export type SelectedFilters = {
    selectedClaseGasto: string;
    selectedTipoProveedor: string;
    selectedCompany: string;
    selectedUnidad: string;
    selectedBeneficiario: string;
    selectedCurrency:string;
    selectedStatus:string;
}
export type FilterData={
    claseGasto: string[];
    tipoProveedor:string[];
    company:string[];
    unidad:string[];
    beneficiario:string[];
    currency:string[];
    status:string[] 
}