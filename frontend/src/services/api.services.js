import api from "../lib/axios";





export const signUp = async (data) => {
  const res = await api.post("/auth/signUp", data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post("/auth/otpVerification", data);
  return res.data;
}
