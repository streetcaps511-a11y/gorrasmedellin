import api from "../../../shared/services/api";

export const fetchOffers = async () => {
  const res = await api.get("/api/productos");
  return res.data?.data?.products || [];
};
