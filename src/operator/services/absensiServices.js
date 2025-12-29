import { API_BASE_URL } from "@/services/apiService";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const absenMasuk = async (foto) => {
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

export const absenKeluar = async (foto) => {
  const formData = new FormData();
  formData.append("foto_out", foto);

  const response = await fetch(
    `${API_BASE_URL}/absensi-operator/out`,
    {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    }
  );

  return response.json();
};
