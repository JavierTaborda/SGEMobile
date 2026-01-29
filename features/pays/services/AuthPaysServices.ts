import API from "@/lib/axios";
import { PlanPagos } from "../interfaces/PlanPagos";
import { PlanificacionPago } from "../interfaces/PlanificacionPagos";
import { CodeSwift } from "../interfaces/SwiftCode";
import { ResultPostAuth, ResultPostPlan } from "../types/ResultPosts";
//import AuthPayData from '../data/AuthPayData.json';

export const getPaysToAuthorize = async () => {
  const response = await API.get("/pays");
  const documents: PlanPagos[] = response.data;
  return documents;
  // return AuthPayData
};
export const authDocuments = async (documents: PlanPagos[]): Promise<ResultPostAuth> => {
  const response = await API.post("/pays/", documents);
  return response.data;
};

export const getMethodPays = async () => {
  const response = await API.get("/pays/methods");
  return response.data;
};

export const getSwiftCodes = async (): Promise<CodeSwift[]> => {
  const response = await API.get("/pays/swift");
  return response.data;
};

export const createPlan = async (
  item: PlanificacionPago,
): Promise<ResultPostPlan> => {
  const response = await API.post("/pays/create-plan", item);
  return response.data;
};
