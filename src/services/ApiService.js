// File: src/services/apiService.js

const API_BASE_URL = '/api'; 

const handleResponse = async (response) => {
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

/**
 * GET STATUS PERNIKAHAN (untuk dropdown)
 */
export const getStatusPernikahanOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/status-pernikahan`);
  return handleResponse(response);
}