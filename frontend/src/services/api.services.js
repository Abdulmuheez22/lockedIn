import api from "../lib/axios";





export const signUp = async (data) => {
  const res = await api.post("/auth/signUp", data);
  return res.data;
};
