import { API_BASE_URL, handleResponse } from "@/services/apiService";


const BACKEND_URL = "http://localhost:5000";
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (isRefreshing) {
      // Queue request kalau lagi refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(`${BACKEND_URL}${url}`, { ...options, headers });
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;
    failedQueue = [];

    try {
      const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,  // JWT Extended butuh access token lama untuk refresh
        },
      });

      if (!refreshResponse.ok) throw new Error("Refresh failed");

      const data = await refreshResponse.json();
      const newToken = data.access_token;

      localStorage.setItem("access_token", newToken);
      processQueue(null, newToken);

      // Ulangi request asli dengan token baru
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${BACKEND_URL}${url}`, { ...options, headers });
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

// =======================
// LOGIN
// =======================

export const login = async (id, password) => {
  const payload = {
    id,        // SESUAI DTO BACKEND
    password,
  };

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// =======================
// LOGOUT
// =======================
export const logout = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

// =======================
// REFRESH TOKEN
// =======================
export const refreshToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
