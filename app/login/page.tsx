"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useUser, User } from "../components/userContext";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  success?: boolean;
}

export default function Login() {
  const router = useRouter();
  const { loginUser, user } = useUser();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirigir automáticamente si ya está logueado
  useEffect(() => {
    if (user) {
      if (user.rol === "admin" || user.rol === "vendedor") {
        router.replace(`/dashboard/${user.id}`);
      } else {
        router.replace("/");
      }
    }
  }, [user, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://europadel-back.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data?.user?.nombre || "Credenciales incorrectas";
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Usuario o contraseña incorrectos",
        });
        return;
      }

      // ✅ CORRECCIÓN CRÍTICA: Guardar token correctamente
      const token = data.token;
      
      // 1. Guardar en localStorage (para persistencia)
      localStorage.setItem("token", token);
      localStorage.setItem("rol", data.user.rol);
      localStorage.setItem("userId", data.user.id);
      
      // 2. Guardar en sessionStorage (para dashboard admin)
      sessionStorage.setItem("authTokenAdmin", token);
      sessionStorage.setItem("isAuthenticatedAdmin", "true");

      // 3. Actualizar contexto (SIN prefijo "token")
      loginUser(data.user, token);

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Hola ${data.user.nombre}!`,
        showConfirmButton: false,
        timer: 1500,
      });

      // ✅ Redirigir según rol
      setTimeout(() => {
        if (data.user.rol === "admin" || data.user.rol === "vendedor") {
          router.push(`/dashboard/${data.user.id}`);
        } else {
          router.push("/");
        }
      }, 1600);

    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error de conexión. Intenta nuevamente.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🔐 Iniciar Sesión
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none transition text-gray-900"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none transition text-gray-900 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </button>

          <Link 
            href="/resetpass"
            className="block text-center text-purple-600 hover:text-purple-800 text-sm font-semibold mt-4"
          >
            Recuperar contraseña
          </Link>
        </form>
      </div>
    </div>
  );
}

