import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Replace localhost with your machine's IP
export const baseUrl = 'https://fitnessbackend-b7hg.onrender.com/';
// export const baseUrl = 'https://fitnessbackend-b7hg.onrender.com/';

const getHeaders = async (contentType = 'application/json') => {
  const token = await AsyncStorage.getItem("token");
  // console.log(token);
  
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  const headers = {
    Accept: 'application/json',
    'Content-Type': contentType,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (refreshToken) {
    headers.RefreshToken = `Bearer ${refreshToken}`;
  }

  return headers;
};

export const PostApiRequest = async (url, data, isMultipart = false) => {
  const headers = await getHeaders(isMultipart ? 'multipart/form-data' : 'application/json');
  const result = await axios.post(baseUrl + url, data, { headers });
  return result;
};

export const GetApiRequest = async (url) => {
  const headers = await getHeaders();
  const result = await axios.get(baseUrl + url, { headers });
  return result;
};

export const PutApiRequest = async (url, data, isMultipart = false) => {
  const headers = await getHeaders(isMultipart ? 'multipart/form-data' : 'application/json');
  const result = await axios.put(baseUrl + url, data, { headers });
  return result;
};

export const DeleteApiRequest = async (url) => {
  const headers = await getHeaders();
  const result = await axios.delete(baseUrl + url, { headers });
  return result;
};