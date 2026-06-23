import axios from "axios";

import store from "@/store/store.js";

import {
  openSessionModal,
} from "@/store/sessionSlice";

/* ================= INSTANCE ================= */

const axiosReq = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

/* ================= REQUEST QUEUE ================= */

let isRefreshing = false;

let failedQueue = [];

/* ================= PROCESS QUEUE ================= */

const processQueue = () => {
  failedQueue.forEach((prom) => prom.resolve());

  failedQueue = [];
};

const rejectQueue = (error) => {
  failedQueue.forEach((prom) => prom.reject(error));

  failedQueue = [];
};

/* ================= RESPONSE INTERCEPTOR ================= */

axiosReq.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    const status = error.response?.status;

    /* ================= SKIP REAUTH API ================= */

    const isReAuthRequest =
      originalRequest.url?.includes(
        "/api/auth/re-authenticate"
      );

    if (isReAuthRequest) {
      return Promise.reject(error);
    }

    /* ================= AUTH CHECK ================= */

    const isAuthError = status === 401;

    if (isAuthError && !originalRequest._retry) {

      originalRequest._retry = true;

      if (!isRefreshing) {

        isRefreshing = true;

        store.dispatch(openSessionModal());
      }

      return new Promise((resolve, reject) => {

        failedQueue.push({
          resolve: () =>
            resolve(axiosReq(originalRequest)),
          reject,
        });

      });
    }

    return Promise.reject(error);
  }
);
/* ================= EXPORTS ================= */

export {
  processQueue,
  rejectQueue,
};

export default axiosReq;