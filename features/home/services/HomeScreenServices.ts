import api from "@/lib/axios";

export const getSummary = async (user?: string) => {
  const response = await api.get("pays/sumary");
  return response.data;
};
