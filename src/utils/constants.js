// src/utils/constants.js

const backendUrl =
  // import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// untuk akses file (foto, static)
export const BACKEND_BASE_URL = backendUrl;

// 🔥 INI FIX UTAMA
export const API_BASE_URL = `${backendUrl}/api`;


// ==============================
// BACKEND OTOMAX (MSSQL / PIVOT)
// ==============================
export const OTOMAX_BACKEND_URL =
  import.meta.env.VITE_BACKEND_OTOMAX_URL || "http://localhost:5000";

export const OTOMAX_API_BASE_URL = `${OTOMAX_BACKEND_URL}/api`;

