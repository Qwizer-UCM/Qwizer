import axios from "axios";

const client = axios.create({
  baseURL: `${import.meta.env.REACT_APP_API_URL}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token"),
  },
});

// Request interceptors for API calls
client.interceptors.request.use(
  (config) => {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = localStorage.getItem("token");
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
