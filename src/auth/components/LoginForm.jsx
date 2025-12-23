import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) return;
    onSubmit({ username, password });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#7a0c2e] to-[#4a061b] p-12 flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Employee Management System
          </h1>
          <p className="opacity-90">
            Kelola data karyawan dengan mudah, aman, dan terpusat.
          </p>
        </div>

        

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-10 flex items-center">
          <div className="max-w-md w-full mx-auto">
            <h1 className="md:hidden text-2xl font-bold text-[#7a0c2e] mb-6">
            Employee Management System
            </h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-8">
              Silakan login ke akun Anda
            </p>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-600">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#7a0c2e]"
                placeholder="Masukkan username"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-4 py-3 rounded-lg border pr-12 focus:ring-2 focus:ring-[#7a0c2e]"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-[#7a0c2e] hover:bg-[#5f0a24] text-white font-semibold py-3 rounded-lg transition shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
