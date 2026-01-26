import { handleResponse } from "@/services/apiService";
import { fetchWithAuth } from "@/services/authServices";

const BACKEND_URL = "http://localhost:5000";

export const submitKunjungan = async ({
  foto,
  latitude,
  longitude,
  issue,
  id_kategori_kunjungan,
}) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Token tidak ditemukan, silakan login ulang");
  }

  const formData = new FormData();
  formData.append("foto", foto);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("issue", issue);
  formData.append("id_kategori_kunjungan", id_kategori_kunjungan);

  // Ganti baris ini:
  const response = await fetchWithAuth("/api/kunjungan/kunjungan", {
    method: "POST", 
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response);
};