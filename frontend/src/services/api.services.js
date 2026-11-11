import api from "../lib/axios";





export const signUp = async () => {
  const res = await api.post("/auth/signUp");
  return res.data
};
