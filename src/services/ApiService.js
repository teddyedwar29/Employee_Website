// File: src/services/apiService.js
export const API_BASE_URL = '/api'; 
import Swal from 'sweetalert2';

export const handleResponse = async (response) => {
  // === TANGKAP 401 UNAUTHORIZED SECARA GLOBAL ===
  if (response.status === 401) {
    // Hapus token
    localStorage.removeItem("access_token");
    // Optional: hapus data user lain kalau ada
    // localStorage.removeItem("user_data");

    Swal.fire({
      icon: "warning",
      title: "Sesi Berakhir",
      text: "Token login Anda telah kadaluarsa. Silakan login ulang.",
      confirmButtonText: "Login Ulang",
    }).then(() => {
      // Redirect ke halaman login
      window.location.href = "/login";  // Ganti dengan path login kamu
    });

    // Throw error biar fetch di component berhenti
    throw new Error("Unauthorized - Sesi berakhir");
  }


  if (response.status === 204) {
    return { ok: true };
  }
  
  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    if (response.ok) {
      return { ok: true };
    }
    throw new Error(response.statusText || 'Terjadi kesalahan pada server');
  }
  
  if (response.ok) {
    return responseData;
  }


  // treat as success to avoid false error messages on frontend.
  if (responseData && (responseData.id || (responseData.data && responseData.data.id) || responseData.ok === true)) {
    console.warn('Non-2xx response but body contains resource/ok flag — treating as success', response.status, responseData);
    return responseData;
  }
  
  console.error('API Error Response:', {
    status: response.status,
    statusText: response.statusText,
    fullData: responseData
  });
  
  let errorMessage = responseData.message || responseData.error || response.statusText || 'Terjadi kesalahan pada server';
  
  if (responseData.errors && typeof responseData.errors === 'object') {
    const errorMessages = Object.entries(responseData.errors)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
      .join('; ');
    if (errorMessages) {
      errorMessage = errorMessages;
    }
  }
  
  throw new Error(errorMessage);
};



/**
 * CREATE (POST)
 */
export const createEmployee = async (employeeData) => {
  console.log('Mengirim POST ke /api/karyawan dengan data:', employeeData);
  
  const response = await fetch(`${API_BASE_URL}/karyawan`, { 
    method: 'POST',
    headers: { 
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
  console.log('Fetching data from /api/karyawan...');
  
  const response = await fetch(`${API_BASE_URL}/karyawan`);
  const data = await handleResponse(response);
  
  console.log('Raw response from /api/karyawan:', data);
  
  return data;
};

/**
 * ✅ DELETE (DELETE) - DIAKTIFKAN
 */
export const deleteEmployee = async (employeeId) => {
  console.log(`Deleting employee with ID: ${employeeId}`);
  
  const response = await fetch(`${API_BASE_URL}/karyawan/${employeeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse(response);
};

/**
 * UPDATE (PUT / PATCH) - NONAKTIF SEMENTARA (belum dipakai)
 */
export const updateEmployee = async (employeeId, employeeData) => {
  console.log(`Mengirim PUT ke /api/karyawan/${employeeId}`, employeeData);
  const response = await fetch(`${API_BASE_URL}/karyawan/${employeeId}`, {
    method: 'PUT', // atau 'PATCH', sesuaikan dengan API-mu
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return handleResponse(response);
};

/**
 * GET JABATAN (untuk dropdown)
 */
export const getJabatanOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/jabatan`);
  return handleResponse(response);
};

// Create Jabatan 
export const createJabatan = async (jabatanData) => {
  console.log('POST /api/jabatan =>', jabatanData);
  const response = await fetch(`${API_BASE_URL}/jabatan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jabatanData),
  });
  return handleResponse(response);
};

// Update Jabatan
export const updateJabatan = async (id, jabatanData) => {
  console.log(`PUT /api/jabatan/${id} =>`, jabatanData);
  const response = await fetch(`${API_BASE_URL}/jabatan/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jabatanData)
  });
  return handleResponse(response);
}

// Delete Jabatan
export const deleteJabatan = async (id) => {
  console.log(`DELETE /api/jabatan/${id}`);
  const response = await fetch (`${API_BASE_URL}/jabatan/${id}`, {
    method: 'DELETE',
    header: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
}





/**
 * GET STATUS KERJA (untuk dropdown)
 */
export const getStatusKerjaOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/status-kerja`);
  return handleResponse(response);
};

// create status kerja
export const createStatusKerja = async (data) => {
  const payload = {
    id: data.id,
    nama_status: data.nama_status,
  };

  const response = await fetch(`${API_BASE_URL}/status-kerja`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// delete status kerja
export const deleteStatusKerja = async (id) => {
  const response = await fetch(`${API_BASE_URL}/status-kerja/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};



// STATUS PERNIKAHAN (pakai trailing slash untuk menghindari redirect)
const STATUS_PERNIKAHAN_BASE = `${API_BASE_URL}/status-pernikahan/`;

// GET
export const getStatusPernikahanOptions = async () => {
  const response = await fetch(STATUS_PERNIKAHAN_BASE);
  return handleResponse(response);
};

// CREATE
export const createStatusPernikahan = async (data) => {
  const payload = {
    // backend nampaknya pakai 'nama' -> kirim hanya 'nama'
    nama: data.nama || data.nama_status_pernikahan || data.name || ''
  };

  console.log('POST /api/status-pernikahan =>', payload);

  const response = await fetch(STATUS_PERNIKAHAN_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// UPDATE
export const updateStatusPernikahan = async (id, data) => {
  const payload = {
    nama: data.nama || data.nama_status_pernikahan || data.name || ''
  };

  console.log('PUT /api/status-pernikahan/' + id, payload);

  const response = await fetch(`${STATUS_PERNIKAHAN_BASE}${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// DELETE
export const deleteStatusPernikahan = async (id) => {
  const response = await fetch(`${STATUS_PERNIKAHAN_BASE}${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};



// get agama

export const getAgamaOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/agama`);
  return handleResponse(response);
};

// post agama
export const createAgama = async (data) => {
  const payload = {
    nama: data.nama,
    nama_agama: data.nama_agama,
  };

  const response = await fetch(`${API_BASE_URL}/agama`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// delete agama
export const deleteAgama = async (id) => {
  const response = await fetch(`${API_BASE_URL}/agama/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};


export const getDepartemenOptions = async () => {
  const res = await fetch(`${API_BASE_URL}/departemen`);
  return handleResponse(res);
};

export const createDepartemen = async (data) => {
  const res = await fetch(`${API_BASE_URL}/departemen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_departemen: data.nama_departemen,
    }),
  });
  return handleResponse(res);
};

export const updateDepartemen = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/departemen/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_departemen: data.nama_departemen,
    }),
  });
  return handleResponse(res);
};

export const deleteDepartemen = async (id) => {
  const res = await fetch(`${API_BASE_URL}/departemen/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
};


// KONDISI AKUN

export const getKondisiAkunOptions = async () => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun`);
  return handleResponse(res);
};

export const createKondisiAkun = async (data) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: data.id,
      nama_kondisi_akun: data.nama_kondisi_akun,
    }),
  });
  return handleResponse(res);
};

export const updateKondisiAkun = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_kondisi_akun: data.nama_kondisi_akun,
    }),
  });
  return handleResponse(res);
};

export const deleteKondisiAkun = async (id) => {
  const res = await fetch(`${API_BASE_URL}/kondisi-akun/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
};


// Gaji Setting
export const getGajiSettings = async () => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting`);
  return handleResponse(res);
};

export const getGajiSettingById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`);
  return handleResponse(res);
};

export const createGajiSetting = async (payload) => {
  // payload harus berisi:
  // { departemen_id, jabatan_id, status_kerja_id, gaji_pokok, tunjangan_pokok,
  //   tunjangan_opsional?: [{keterangan, jumlah}], potongan_opsional?: [{keterangan, jumlah}] }
  console.log('POST /api/gaji-setting =>', payload);
  const res = await fetch(`${API_BASE_URL}/gaji-setting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateGajiSetting = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteGajiSetting = async (id) => {
  const res = await fetch(`${API_BASE_URL}/gaji-setting/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};