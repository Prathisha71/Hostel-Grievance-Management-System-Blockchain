import axios from "axios";

const API = axios.create({
  baseURL: "/", // same port as backend
  headers: { "Content-Type": "application/json" },
});

export default API;
