import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers, params) => {
  // Get token from localStorage
  const token = JSON.parse(localStorage.getItem("token"));

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      ...headers,
    },
    params: params ? params : null,
  });
};
