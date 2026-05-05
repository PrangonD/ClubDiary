import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  timeout: 15000,
});

export const setToken = (token) => {
  if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete API.defaults.headers.common.Authorization;
};
