import { API_BASE_URL } from "@/services/apiService";

export const getMyAbsensi = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/absensi/report/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};
