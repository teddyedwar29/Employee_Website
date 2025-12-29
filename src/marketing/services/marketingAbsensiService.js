import { API_BASE_URL } from "@/services/apiService";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// =======================
// ABSEN MASUK MARKETING
// =======================
// NOTE:
// - Endpoint masih PAKAI operator
// - Sesuai info kamu: operator & AE sama untuk IN
export const absenMasukMarketing = async (foto) => {
  const formData = new FormData();
  formData.append("foto_in", foto);

  const response = await fetch(
    `${API_BASE_URL}/absensi-operator/in`,
    {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    }
  );

  return response.json();
};

// =======================
// ABSEN KELUAR MARKETING (AE)
// =======================
// NOTE:
// - Endpoint KHUSUS AE
// - Ada syarat kunjungan (handled di frontend)
export const absenKeluarMarketing = async (foto) => {
  const formData = new FormData();
  formData.append("foto_out", foto);

  const response = await fetch(
    `${API_BASE_URL}/absensi-ae/out`,
    {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    }
  );

  return response.json();
};
