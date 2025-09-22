import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { store } from "../store";
import { setExpired } from "../store/slices/AuthConfig";
import { useSelector } from "react-redux";
export const baseUrl = "https://www.fitness.tacosdecrema.com/";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = store.getState()?.authConfigs?.token;

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 440) {
        store.dispatch(setExpired(true));
      } else {
        store.dispatch(setExpired(false));
      }
    }
    return Promise.reject(error);
  }
);

export const PostApiRequest = async (url, data, isMultipart = false) => {
  const result = await api.post(url, data, {
    headers: {
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  });
  return result;
};

export const GetApiRequest = async (url) => {
  const result = await api.get(url);
  return result;
};

export const PutApiRequest = async (url, data, isMultipart = false) => {
  const result = await api.put(url, data, {
    headers: {
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  });
  return result;
};

export const DeleteApiRequest = async (url) => {
  const result = await api.delete(url);
  return result;
};
