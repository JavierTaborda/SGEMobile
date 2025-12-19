import API from '@/lib/axios';
import AuthPayData from '../data/AuthPayData.json';

export const getPaysToAuthorize = async () => {
  //const response = await API.get('/pagos/pendientes');
 // return response.data;
 return AuthPayData
};

export const getMethodPays = async () => {
  const response = await API.get('/pays/methods');
  return response.data;

};

