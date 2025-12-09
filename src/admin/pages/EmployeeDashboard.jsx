import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../components/layout/EmployeeSidebar';
import DashboardPage from './DashboardPage';
import DataEmployee from './DataEmployee';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import DetailEmployeeModal from '../components/DetailEmployeeModal';
import ResignedEmployeePage from './ResignedEmployeePage';
import MasterJabatanPage from './master/MasterJabatanPage';
import MasterStatusKerjaPage from './master/MasterStatusKerjaPage';
import MasterStatusPernikahanPage from './master/MasterStatusPernikahanPage';

import { 
  getEmployees, 
  createEmployee,
  deleteEmployee,
  updateEmployee,
  getJabatanOptions,
  getStatusKerjaOptions,
  getStatusPernikahanOptions
} from '../../services/apiService'; 

const DEPARTMENT_COLORS = [
  'from-gray-400 to-gray-600',
  'from-orange-400 to-orange-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
];


export default function EmployeeDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  
  // 1. State BARU untuk Sidebar Responsive
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dropdown options
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [statusKerjaOptions, setStatusKerjaOptions] = useState([]);
  const [statusPernikahanOptions, setStatusPernikahanOptions] = useState([]); 


  // ... (loadData, useEffects, dan semua handler (handleAdd, handleDelete, handleEdit, handleUpdate) TETAP SAMA, tidak diubah) ...
  const loadData = async () => {
    try {
      const [employeeData, jabatanData, statusData, statusPernikahanData] = await Promise.all([
        getEmployees(), 
        getJabatanOptions(),
        getStatusKerjaOptions(),
        getStatusPernikahanOptions()
      ]);
      
      if (Array.isArray(employeeData)) {
        setEmployees(employeeData);
      } else if (employeeData && Array.isArray(employeeData.data)) {
        setEmployees(employeeData.data);
      } else {
        console.warn('Data Karyawan dari API bukan array:', employeeData);
        setEmployees([]);
      }
      
      if (Array.isArray(jabatanData)) {
        setJabatanOptions(jabatanData);
      } else if (jabatanData && Array.isArray(jabatanData.data)) {
        setJabatanOptions(jabatanData.data);
      } else {
        console.warn('Data Jabatan dari API bukan array:', jabatanData);
        setJabatanOptions([]);
      }
      
      if (Array.isArray(statusData)) {
        setStatusKerjaOptions(statusData);
      } else if (statusData && Array.isArray(statusData.data)) {
        setStatusKerjaOptions(statusData.data);
      } else {
        console.warn('Data Status Kerja dari API bukan array:', statusData);
        setStatusKerjaOptions([]);
      }

      if (Array.isArray(statusPernikahanData)) {
        setStatusPernikahanOptions(statusPernikahanData);
      } else if (statusPernikahanData && Array.isArray(statusPernikahanData.data)) {
        setStatusPernikahanOptions(statusPernikahanData.data);
      } else {
        console.warn('Data Status Pernikahan dari API bukan array:', statusPernikahanData);
        setStatusPernikahanOptions([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, []); 

  useEffect(() => {
  const path = location.pathname;
  if (path.includes('/karyawan-berhenti')) {
    setActiveMenu('berhenti');
  } else if (path.includes('/master/jabatan')) {
    setActiveMenu('master-jabatan');
  } else if (path.includes('/master/status-pernikahan')) {
    setActiveMenu('master-status-pernikahan');
  } 
  else if (path.includes('/master/status-kerja')) {
    setActiveMenu('master-status-kerja');
  } 
  else if (path.includes('/karyawan')) {
    setActiveMenu('karyawan');
  } else {
    setActiveMenu('dashboard');
  }
  setIsSidebarOpen(false);
}, [location]);

  const handleAddEmployee = async (formData) => {
    try {
      await createEmployee(formData); 
      await loadData(); 
    } catch (err) {
      console.error('Gagal menambah karyawan:', err);
      throw err; 
    }
  };
  
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Apakah kamu yakin ingin menghapus karyawan ini?')) {
      return;
    }
    try {
      await deleteEmployee(employeeId);
      await loadData(); 
    } catch (err) {
      console.error('Gagal menghapus karyawan:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);   
  };

  const handleUpdateEmployee = async (employeeId, formData) => {
    try {
      await updateEmployee(employeeId, formData);
      await loadData(); 
    } catch (err) {
      console.error('Gagal mengupdate karyawan:', err);
      throw err;
    }
  };
  
  const handleDetailClick = (employee) => {
    setViewingEmployee(employee);
    setIsDetailModalOpen(true);   
  };

  // ... (Semua logic kalkulasi (useMemo) di bawah ini sudah benar) ...
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => {
    const status = e.status_kerja?.nama_status?.toLowerCase();
    return status === 'aktif' || status === 'kontrak';
  }).length;
  const employeesBerhenti = employees.filter(
  e => e.status_kerja?.nama_status?.toLowerCase() === 'berhenti'
  );

  const DEPARTMENTS_CONFIG = useMemo(() => {
      const config = {};

      // 1. Inisialisasi semua jabatan dari API (jabatanOptions)
      (jabatanOptions || []).forEach((jab, index) => {
        const name = jab.nama_jabatan || jab.nama;
        if (!name) return;

        config[name] = {
          count: 0,
          color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
        };
      });

      // 2. Hitung jumlah karyawan per jabatan
      (employees || []).forEach((emp) => {
        const name = emp.jabatan?.nama_jabatan || emp.jabatan?.nama;
        if (!name) return;

        // kalau ada jabatan di karyawan tapi belum ada di config, tambahin
        if (!config[name]) {
          const index = Object.keys(config).length;
          config[name] = {
            count: 0,
            color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
          };
        }

        config[name].count += 1;
      });

      return config;
}, [employees, jabatanOptions]);



  const allJabatanOptions = useMemo(
    () => ['Semua', ...jabatanOptions.map(j => j.nama_jabatan || j.nama)],
    [jabatanOptions]
  );
  const allStatusKerjaOptions = useMemo(
    () => ['Semua', ...statusKerjaOptions.map(s => s.nama_status || s.nama)],
    [statusKerjaOptions]
  );
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!Array.isArray(employees)) {
      return []; 
    }
    return employees.filter(emp => {
      const matchSearch =
        (emp.nama && emp.nama.toLowerCase().includes(q)) ||
        (emp.nik && String(emp.nik).toLowerCase().includes(q)) ||
        (emp.jabatan?.nama_jabatan && emp.jabatan.nama_jabatan.toLowerCase().includes(q));
      const matchJabatan =
        filterDepartment === 'Semua' || (emp.jabatan?.nama_jabatan === filterDepartment);
      const matchStatus =
        filterStatus === 'Semua' || (emp.status_kerja?.nama_status === filterStatus);
      return matchSearch && matchJabatan && matchStatus;
    });
  }, [searchTerm, filterDepartment, filterStatus, employees]);

  
  // ... (Loading & Error handling sudah benar) ...
  if (isLoading && employees.length === 0) { 
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-700">
          Memuat data...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h3>
          <p className="text-lg text-gray-700 mb-2">
            Gagal memuat data. (Error: {error})
          </p>
          <p className="text-gray-600">Pastikan URL API di `apiService.js` sudah benar dan API-nya berjalan.</p>
        </div>
      </div>
    );
  }

  // --- Render UI Utama ---
  return (
    // 3. Ubah class 'flex' jadi 'relative flex'
    <div className="relative flex h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-purple-100">
      {/* 4. Tambah Backdrop untuk mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ... (Semua Modal sudah benar) ... */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
        jabatanOptions={jabatanOptions}
        statusKerjaOptions={statusKerjaOptions}
        statusPernikahanOptions={statusPernikahanOptions}
      />
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateEmployee={handleUpdateEmployee}
        employeeData={editingEmployee}
        jabatanOptions={jabatanOptions}
        statusKerjaOptions={statusKerjaOptions}
        statusPernikahanOptions={statusPernikahanOptions}
      />
      <DetailEmployeeModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        employeeData={viewingEmployee} 
        jabatanOptions={jabatanOptions}
        statusKerjaOptions={statusKerjaOptions}
        statusPernikahanOptions={statusPernikahanOptions}
      />
      
      {/* 5. Kirim state ke Sidebar */}
      <EmployeeSidebar
        activeMenu={activeMenu}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 6. Ubah class 'flex-1' */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div key={activeMenu} className="fade-in-up">
          {(() => {
            if (activeMenu === 'dashboard') {
              return (
                <DashboardPage
                  employees={employees}
                  totalEmployees={totalEmployees}
                  activeEmployees={activeEmployees}
                  departments={DEPARTMENTS_CONFIG}
                  onSeeAllEmployees={() => navigate('/admin/karyawan')}
                  jabatanOptions={jabatanOptions}
                  statusKerjaOptions={statusKerjaOptions}
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
              );
            }

            if (activeMenu === 'karyawan') {
              return (
                <DataEmployee
                  searchTerm={searchTerm}
                  onChangeSearch={setSearchTerm}
                  filterDepartment={filterDepartment}
                  onChangeDepartment={setFilterDepartment}
                  filterStatus={filterStatus}
                  onChangeStatus={setFilterStatus}
                  totalEmployees={totalEmployees}
                  filteredEmployees={filteredEmployees}
                  allDepartments={allJabatanOptions}
                  allStatusOptions={allStatusKerjaOptions}
                  jabatanOptions={jabatanOptions}
                  statusKerjaOptions={statusKerjaOptions}
                  onAddClick={() => setIsAddModalOpen(true)}
                  onDeleteEmployee={handleDeleteEmployee}
                  onEditClick={handleEditClick}
                  onDetailClick={handleDetailClick}
                  isLoading={isLoading}
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
              );
            }

            if (activeMenu === 'berhenti') {
              return (
                <ResignedEmployeePage
                  employeesBerhenti={employeesBerhenti}
                  jabatanOptions={jabatanOptions}
                />
              );
            }

            if (activeMenu === 'master-jabatan') {
              return <MasterJabatanPage />;
            }

            if (activeMenu === 'master-status-kerja') {
              return <MasterStatusKerjaPage />;
            }

            if (activeMenu === 'master-status-pernikahan') {
              return <MasterStatusPernikahanPage />;
            }

            // fallback
            return <DashboardPage
              employees={employees}
              totalEmployees={totalEmployees}
              activeEmployees={activeEmployees}
              departments={DEPARTMENTS_CONFIG}
              onSeeAllEmployees={() => navigate('/admin/karyawan')}
              jabatanOptions={jabatanOptions}
              statusKerjaOptions={statusKerjaOptions}
              onMenuClick={() => setIsSidebarOpen(true)}
            />;
          })()}
        </div>
      </div>


    </div>
  );
}