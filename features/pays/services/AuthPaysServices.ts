import API from '@/lib/axios';
import AuthPayData from '../data/AuthPayData.json';


export const getPaysToAuthorize = async () => {
  // const response = await API.get('/pays/documents');
  // const documents: PlanPagos[] = response.data;
  // return documents;
  return AuthPayData
};

export const getMethodPays = async () => {
  const response = await API.get('/pays/methods');
  return response.data;

};

