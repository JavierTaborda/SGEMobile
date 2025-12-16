// modules/pays/services/AuthPaysServices.ts
//import API from '@/lib/axios';
import AuthPayData from '../data/AuthPayData.json';

export const getPaysToAuthorize = async () => {
  //const response = await API.get('/pagos/pendientes');
 // return response.data;
 return AuthPayData
};

// export const authorizePay = async (id: string) => {
//   //const response = await API.post(`/pagos/${id}/autorizar`);
//   return response.data;
// };
