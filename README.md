# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



```
Employee_Website
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ admin
│  │  ├─ components
│  │  │  ├─ AddEmployeeModal.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ EmployeeTable.jsx
│  │  │  │  └─ RightStatsPanel.jsx
│  │  │  ├─ DetailEmployeeModal.jsx
│  │  │  ├─ EditEmployeeModal.jsx
│  │  │  ├─ EmployeeResignForm.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ EmployeeHeader.jsx
│  │  │  │  └─ EmployeeSidebar.jsx
│  │  │  ├─ OtomaxPivotTable.jsx
│  │  │  └─ ProfitHarianCard.jsx
│  │  └─ pages
│  │     ├─ AbsensiReportPage.jsx
│  │     ├─ DashboardPage.jsx
│  │     ├─ DataEmployee.jsx
│  │     ├─ EmployeeDashboard.jsx
│  │     ├─ IzinPage.jsx
│  │     ├─ KunjunganReportPage.jsx
│  │     ├─ master
│  │     │  ├─ MasterAgamaPage.jsx
│  │     │  ├─ MasterDepartemenPage.jsx
│  │     │  ├─ MasterGajiRulePage.jsx
│  │     │  ├─ MasterGajiSettingPage.jsx
│  │     │  ├─ MasterJabatanPage.jsx
│  │     │  ├─ MasterKondisiAkunPage.jsx
│  │     │  ├─ MasterStatusKerjaPage.jsx
│  │     │  └─ MasterStatusPernikahanPage.jsx
│  │     ├─ OtomaxDataPage.jsx
│  │     ├─ ReportPage.jsx
│  │     └─ ResignedEmployeePage.jsx
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ auth
│  │  ├─ components
│  │  │  ├─ LoginForm.jsx
│  │  │  └─ ProtectedRoute.jsx
│  │  └─ pages
│  │     └─ LoginPage.jsx
│  ├─ components
│  │  └─ ui
│  │     ├─ Badge.jsx
│  │     ├─ Button.jsx
│  │     ├─ Card.jsx
│  │     ├─ Input.jsx
│  │     ├─ Modal.jsx
│  │     ├─ PageHeader.jsx
│  │     ├─ Pagination.jsx
│  │     ├─ Select.jsx
│  │     └─ Table.jsx
│  ├─ hooks
│  │  └─ useCamera.js
│  ├─ index.css
│  ├─ main.jsx
│  ├─ marketing
│  │  ├─ components
│  │  │  └─ MarketingAbsensiModal.jsx
│  │  ├─ config
│  │  │  └─ marketingMenu.js
│  │  ├─ layout
│  │  │  ├─ MarketingLayout.jsx
│  │  │  └─ MarketingSidebar.jsx
│  │  ├─ pages
│  │  │  ├─ KunjunganPage.jsx
│  │  │  ├─ LaporanPencapaianMarketing.jsx
│  │  │  ├─ MarketingAttendancePage.jsx
│  │  │  └─ RiwayatAbsensiMarketing.jsx
│  │  └─ services
│  │     ├─ kunjunganService.js
│  │     └─ marketingAbsensiService.js
│  ├─ operator
│  │  ├─ components
│  │  │  └─ AbsensiModal.jsx
│  │  ├─ config
│  │  │  └─ operatorMenu.js
│  │  ├─ layout
│  │  │  ├─ OperatorLayout.jsx
│  │  │  └─ OperatorSidebar.jsx
│  │  ├─ pages
│  │  │  ├─ AttendancePage.jsx
│  │  │  ├─ DashboardPage.jsx
│  │  │  └─ RiwayatAbsensi.jsx
│  │  └─ services
│  │     └─ absensiServices.js
│  ├─ services
│  │  ├─ absensiReportService.js
│  │  ├─ ApiService.js
│  │  └─ authServices.js
│  ├─ shared
│  │  ├─ attendance
│  │  │  ├─ AttendanceCameraModal.jsx
│  │  │  └─ TeamAttendanceDashboard.jsx
│  │  └─ sidebar
│  │     └─ SidebarItems.jsx
│  └─ utils
│     ├─ auth.js
│     ├─ constants.js
│     └─ date.js
└─ vite.config.js

```