// src/utils/constants.js

const backendUrl =
  // import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  import.meta.env.VITE_BACKEND_URL || "http://103.179.66.122:8000";

// untuk akses file (foto, static)
export const BACKEND_BASE_URL = backendUrl;

// 🔥 INI FIX UTAMA
export const API_BASE_URL = `${backendUrl}/api`;
