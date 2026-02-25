import { handleResponse } from "@/services/apiService";
import { API_BASE_URL, BACKEND_BASE_URL, OTOMAX_API_BASE_URL } from "@/utils/constants";


export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn("Unauthorized detected");
    // ❌ JANGAN hapus token disini
    // ❌ JANGAN redirect disini
    throw new Error("Unauthorized");
  }

  return response;
};

// 🔥 KHUSUS OTOMAX / MSSQL
export const fetchWithAuthOtomax = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${OTOMAX_API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

// =======================
// LOGIN
// =======================

export const login = async (id, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password }),
  });

  return handleResponse(response, { skipAuth: true });
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
