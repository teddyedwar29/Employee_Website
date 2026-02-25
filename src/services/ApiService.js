// File: src/services/apiService.js
import { BACKEND_BASE_URL, API_BASE_URL, OTOMAX_API_BASE_URL } from '@/utils/constants';


import Swal from 'sweetalert2';



export const handleResponse = async (response, options = {}) => {
  const { skipAuth = false } = options;

  // 🔥 GLOBAL 401 → HANYA UNTUK REQUEST YANG BUTUH TOKEN
  if (response.status === 401 && !skipAuth) {
    localStorage.removeItem("access_token");

    await Swal.fire({
      icon: "warning",
      title: "Sesi Berakhir",
      text: "Sesi login Anda telah berakhir. Silakan login ulang.",
      confirmButtonText: "Login",
    });

    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (response.status === 204) return { ok: true };

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    if (response.ok) return { ok: true };
    throw new Error(response.statusText);
  }

  if (response.ok) return responseData;

  throw new Error(responseData.message || "Terjadi kesalahan");
};


const authHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * CREATE (POST)
 */
export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/karyawan/`, { 
    method: 'POST',
    headers: {
      ...authHeader(), 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return handleResponse(response);
};

/**
 * ✅ READ (GET All) - DIAKTIFKAN
 */
export const getEmployees = async () => {

  const response = await fetch(`${API_BASE_URL}/karyawan/`,{
    headers: {
      ...authHeader(),
    },
  });
  const data = await handleResponse(response);
  
  return data;
};

/**
 * DELETE data karyawan
 */
export const deleteEmployee = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/karyawan/${employeeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  
  return handleResponse(response);
};

/**
 * UPDATE data karyawan
 */
export const updateEmployee = async (employeeId, employeeData) => {
  const response = await fetch(`${API_BASE_URL}/karyawan/${employeeId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(employeeData),
  });
  return handleResponse(response);
};

/**
 * GET JABATAN
 */
export const getJabatanOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/jabatan/`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};

// Create Jabatan 
export const createJabatan = async (jabatanData) => {
  const response = await fetch(`${API_BASE_URL}/jabatan/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(jabatanData),
  });
  return handleResponse(response);
};

// Update Jabatan
export const updateJabatan = async (id, jabatanData) => {
  const response = await fetch(`${API_BASE_URL}/jabatan/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(jabatanData)
  });
  return handleResponse(response);
}

// Delete Jabatan
export const deleteJabatan = async (id) => {
  const response = await fetch (`${API_BASE_URL}/jabatan/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(response);
}



/**
 * GET STATUS KERJA 
 */
export const getStatusKerjaOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/status-kerja/`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};

// create status kerja
export const createStatusKerja = async (data) => {
  const payload = {
    nama_status: data.nama_status,
  };

  const response = await fetch(`${API_BASE_URL}/status-kerja/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),

  });

  return handleResponse(response);
};

// update status kerja
export const updateStatusKerja = async (id, data) => {
  const payload = {
    nama_status: data.nama_status,
  };

  const response = await fetch(`${API_BASE_URL}/status-kerja/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// delete status kerja
export const deleteStatusKerja = async (id) => {
  const response = await fetch(`${API_BASE_URL}/status-kerja/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};



// STATUS PERNIKAHAN
const STATUS_PERNIKAHAN_BASE = `${API_BASE_URL}/status-pernikahan/`;

// GET
export const getStatusPernikahanOptions = async () => {
  const response = await fetch(STATUS_PERNIKAHAN_BASE, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};

// CREATE status pernikahan
export const createStatusPernikahan = async (data) => {
  const payload = {
    // backend nampaknya pakai 'nama' -> kirim hanya 'nama'
    nama: data.nama || data.nama_status_pernikahan || data.name || ''
  };

  const response = await fetch(STATUS_PERNIKAHAN_BASE, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// UPDATE status pernikahan
export const updateStatusPernikahan = async (id, data) => {
  const payload = {
    nama: data.nama || data.nama_status_pernikahan || data.name || ''
  };
  const response = await fetch(`${STATUS_PERNIKAHAN_BASE}${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// DELETE status pernikahan
export const deleteStatusPernikahan = async (id) => {
  const response = await fetch(`${STATUS_PERNIKAHAN_BASE}${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};

// get agama
export const getAgamaOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/agama/`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};

// post agama
export const createAgama = async (data) => {
  const payload = {
    nama: data.nama,
    nama_agama: data.nama_agama,
  };

  const response = await fetch(`${API_BASE_URL}/agama/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// put agama
export const updateAgama = async (id, data) => {
  const payload = {
    nama: data.nama,
    nama_agama: data.nama,
  };

  const response = await fetch(`${API_BASE_URL}/agama/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// delete agama
export const deleteAgama = async (id) => {
  const response = await fetch(`${API_BASE_URL}/agama/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(response);
};


// get departemen
export const getDepartemenOptions = async () => {
  const res = await fetch(`${API_BASE_URL}/departemen/`,{
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// create departemen
export const createDepartemen = async (data) => {
  const res = await fetch(`${API_BASE_URL}/departemen/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({
      nama_departemen: data.nama_departemen,
    }),
  });
  return handleResponse(res);
};

// update departemen
export const updateDepartemen = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/departemen/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({
      nama_departemen: data.nama_departemen,
    }),
  });
  return handleResponse(res);
};


// delete departemen
export const deleteDepartemen = async (id) => {
  const res = await fetch(`${API_BASE_URL}/departemen/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};


// GET KONDISI AKUN
export const getKondisiAkunOptions = async () => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// create kondisi akun
export const createKondisiAkun = async (data) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({
      id: data.id,
      nama_kondisi_akun: data.nama_kondisi_akun,
    }),
  });
  return handleResponse(res);
};

// update kondisi akun
export const updateKondisiAkun = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({
      nama_kondisi_akun: data.nama_kondisi_akun,
    }),
  });
  return handleResponse(res);
};

// delete kondisi akun
export const deleteKondisiAkun = async (id) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};


// Gaji Setting
export const getGajiSettings = async () => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const getGajiSettingById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`, {
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const createGajiSetting = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateGajiSetting = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteGajiSetting = async (id) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// ABSENSI ME
export const getAbsensiHariIni = async () => {
  const response = await fetch(`${API_BASE_URL}/absensi/report/me`);
  return handleResponse(response);
};

// =======================
// IZIN (ME)
// =======================
export const getMyIzinHistory = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/izin/my-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};


// =======================
// KATEGORI KUNJUNGAN
// =======================
export const getKategoriKunjungan = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/kategori-kunjungan/ambil`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
};



// =======================
// LAPORAN MASA AKTIF RESELLER
// =======================
export const getLaporanMasaAktifReseller = async (params = {}) => {
  const token = localStorage.getItem("access_token");

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const query = new URLSearchParams(cleanParams).toString();

  const response = await fetch(
    `${OTOMAX_API_BASE_URL}/laporan/masa_aktif/reseller${query ? `?${query}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
};



export const getOmzetLevelAnalytics = async (params = {}) => {
  const token = localStorage.getItem("access_token");

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const query = new URLSearchParams(cleanParams).toString();

  const response = await fetch(
    `${OTOMAX_API_BASE_URL}/v1/analytics/omzet-level${
      query ? `?${query}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
};


export const getTopProdukLevel = async (params = {}) => {
  const token = localStorage.getItem("access_token");

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const query = new URLSearchParams(cleanParams).toString();

  const response = await fetch(
    `${OTOMAX_API_BASE_URL}/v2/analytics/top-produk-level${query ? `?${query}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
};
