import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ||"http://192.168.1.5:8001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});