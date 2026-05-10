import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:8080/api/v1" : "/api",
  withCredentials: true,
});

export default axiosInstance;
