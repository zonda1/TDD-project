import axios from "axios";
import i18n from "../locale/i18n";

export const signUp = (body) => {
  return axios.post("/api/1.0/users", body, {
    headers: {
      "Accept-Language": i18n.language,
    },
  });
};

export const activate = (token) => {
  return axios.post("/api/1.0/users/token/" + token);
};

export const getUsers = (page = 0) => {
  return axios.get("/api/1.0/users", {
    params: {
      page,
      size: 3,
    },
  });
};
export const getUser = (id) => {
  return axios.get(`/api/1.0/users/${id}`);
};

export const login = (body) => {
  return axios.post(`/api/1.0/auth`,body);
};
