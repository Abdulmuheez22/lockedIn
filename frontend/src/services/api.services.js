import api from "../lib/axios";





export const signUp = async (data) => {
  const res = await api.post("/auth/signUp", data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post("/auth/otpVerification", data);
  return res.data;
};

export const signIn = async (data) => {
  const res = await api.post("/auth/signIn", data);
  return res.data;
};

export const resendOtp = async (data) => {
  const res = await api.post("/auth/resendOtp", data);
  return res.data;
};

export const forgetPassword1 = async (data) => {
  const res = await api.post("/auth/forgetPassword1", data);
  return res.data;
};

export const forgetPassword2 = async (data) => {
  const res = await api.post("/auth/forgetPassword2", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/auth/resetPassword", data);
  return res.data;
}