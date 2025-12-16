import api from "@/lib/axios";
import { OrderFilters, procesadosOptions, statusOptions, Vendors, Zones } from "../types/OrderFilters";

export const getOrdersToApproval = async () => {

  try{
  const response = await api.get("orders/approval");
  return response.data;
  }
  catch (error) {
    console.error("Error obteniendo pedidos", error);
    throw error;
  }
};


export const getPedidosFiltrados = async (filters: OrderFilters) => {

  try {
    const adaptedFilters = {
      dateIni: filters.startDate
        ? filters.startDate.toISOString().split("T")[0]
        : undefined,
      dateEnd: filters.endDate
        ? filters.endDate.toISOString().split("T")[0]
        : undefined,
      revisado: filters.status,
      procesado: filters.procesado,
      vendor: filters.seller,
      cancelled: filters.cancelled, 
      zone:filters.zone
    };


    const response = await api.get("orders/filters", {
      params: adaptedFilters, 
    });

    return response.data;
  
  } catch (error) {
    console.error("Error obteniendo pedidos filtrados:", error);
    throw error;
  }
};

export const getOrderProducts = async (fact_num: number) => {
  const response = await api.get(`/orders/rengpedidos/${fact_num}`);
  return response.data;

};

export const changeRevisado = async (fact_num: number, status: string) => {
  try {
    const response = await api.patch(`/orders/${fact_num}`, {
      status,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return { success: false, error };
  }
};

export const UpdateComment = async (fact_num: number, newcomment: string) => {
  try {
    
    const response = await api.patch(`/orders/comment/${fact_num}`, {
      newcomment,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || 'Error desconocido',
        statusCode: error.response?.status || 500,
      },
    };
  }
};

export const getZones = async () => {


  const response = await api.get("/zones");
  const zones: Zones[] = response.data;
  const filterZones = zones
    .map((zon: Zones) =>
      typeof zon.zon_des === "string" ? zon.zon_des.trim() : ""
    )
    .filter((value, index, self) => value && self.indexOf(value) === index);
  return ["TODOS", ...filterZones];
};



export const getVendors = async () => {


  const response = await api.get("/vendors");
  const vendors: Vendors[] = response.data;

  const sellerNames = vendors
    .map((ven: Vendors) =>
      typeof ven.ven_des === "string" ? ven.ven_des.trim() : ""
    )
    .filter((value, index, self) => value && self.indexOf(value) === index);

  return ["TODOS", ...sellerNames];
};

export const getStatus = async () => {
  const statusOptionsList: statusOptions[] = [
    { label: "Todos", value: "" },
    { label: "Por Revisar", value: "0" },
    { label: "Revisado", value: "1" },
  ];
  return statusOptionsList;
};

export const getProcesados= async () => {
  const procesadosOptions: procesadosOptions[] = [
    { label: "Por Procesar", value: "0" },
    { label: "ParcProcesado", value: "1" },
    { label: "Procesado", value: "2" },
  ];
  return procesadosOptions;
};
