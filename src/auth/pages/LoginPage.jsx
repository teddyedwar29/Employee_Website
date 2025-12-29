import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import LoginForm from "@/auth/components/LoginForm";
import { login } from "@/services/authServices";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async ({ username, password }) => {
    try {
      const res = await login(username, password);

      const token = res.access_token;

      // decode JWT (karena role ada di claims)
      const decoded = jwtDecode(token);


      // simpan token & user
      localStorage.setItem("access_token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: decoded.sub,
          jabatan: decoded.jabatan,
          departemen: decoded.departemen,
          status_kerja: decoded.status_kerja,
        })
      );

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang",
        timer: 1500,
        showConfirmButton: false,
      });

      // redirect sesuai jabatan
      switch (decoded.jabatan) {
        case "OPERATOR":
          navigate("/operator/absensi");
          break;
        case "MARKETING":
          navigate("/marketing/absensi");
          break;
        case "IT":
          navigate("/it/absensi");
          break;
        case "HRD":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: err.message || "ID atau password salah",
      });
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
