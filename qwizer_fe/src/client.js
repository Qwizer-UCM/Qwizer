import axios from "axios";

const client = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token"),
  },
});

// Request interceptors for API calls
client.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = localStorage.getItem("token");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
