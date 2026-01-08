import API from '@/lib/axios';
import { PlanPagos } from '../interfaces/PlanPagos';
//import AuthPayData from '../data/AuthPayData.json';


export const getPaysToAuthorize = async () => {
  const response = await API.get('/pays/documents');
  const documents: PlanPagos[] = response.data;
  return documents;
  // return AuthPayData
};

export const getMethodPays = async () => {
  const response = await API.get('/pays/methods');
  return response.data;

};
export const authDocuments = async () => {
  const response = await API.post('/pays/');
  return response.data;

};

