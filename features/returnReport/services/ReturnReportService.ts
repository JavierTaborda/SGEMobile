import api from "@/lib/axios";
import { Articulo } from "../types/Articulo";

import { ClientData } from "@/types/clients";
import { CreateDevolucion } from "../types/createDevolucion";
import { Motive } from "../types/motives";

export const getOrderByFactNumber = async (factNumber: number) => {

  try {
    const response = await api.get(`returns/byfactnumber/${factNumber}`);

    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo pedidos", error);
    throw error;
  }
};
export const getBySerial = async (serial: string) => {

  try {
    const response = await api.get(`returns/byserial/${serial}`);

    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo pedidos", error);
    throw error;
  }
};
export const createDevolucion = async (dev: CreateDevolucion): Promise<boolean> => {
  try {

    const response = await api.post("returns", dev);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
};
export const getClients = async (): Promise<ClientData[]> => {
  try {
    const response = await api.get("customers");

    const clients: ClientData[] = response.data.map((c: any) => ({
      co_cli: c.co_cli?.trim(),
      cli_des: c.cli_des?.split("\r\n")[0]?.trim(),
      co_zon: c.co_zon?.trim(),
      dir_ent2: c.dir_ent2?.trim(),
      direc1: c.direc1?.trim(),
      direc2: c.direc2?.trim(),
    }));
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
};
export const getArts = async (): Promise<Articulo[]> => {
  try {
    const response = await api.get("products/codebar");
    const arts: Articulo[] = response.data
    return arts;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
};
export const getMotives = async (): Promise<Motive[]> => {
  try {
    const response = await api.get("returns/motives");
    const motives: Motive[] = response.data
    return motives;
  } catch (error) {

    return [];
  }
};