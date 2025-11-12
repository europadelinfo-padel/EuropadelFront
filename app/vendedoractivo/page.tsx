// ============================================
// 📁 VendedorActivoPage.tsx - CON GRID 3x3 Y PAGINACIÓN
// ============================================
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Snowflake, 
  Sun, 
  RefreshCw, 
  UserCheck, 
  UserX,
  ShoppingCart,
  Mail,
  Calendar,
  AlertCircle,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const API_URL = 'https://europadel-back.vercel.app/api';

// ✅ TIPOS BIEN DEFINIDOS
interface Vendedor {
  _id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'usuario';
  whatsapp: string | null;
  isVerified: boolean;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  success: boolean;
  data: Vendedor[];
  pagination: Pagination;
}

interface ProcesandoState {
  [key: string]: boolean;
}

const VendedorActivoPage: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<ProcesandoState>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });

  // Cargar vendedores con paginación
  useEffect(() => {
    fetchVendedores(pagination.page);
  }, [pagination.page]);

  const fetchVendedores = async (page: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendedoractivo?page=${page}&limit=9`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar vendedores');
      }

      const data: ApiResponse = await response.json();
      setVendedores(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleFreeze = async (id: string): Promise<void> => {
    try {
      setProcesando(prev => ({ ...prev, [id]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendedoractivo/${id}/freeze`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      const data = await response.json();
      
      setVendedores(prev => 
        prev.map(v => v._id === id ? { ...v, isFrozen: data.data.isFrozen } : v)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error:', errorMessage);
      alert('Error al cambiar estado del vendedor');
    } finally {
      setProcesando(prev => ({ ...prev, [id]: false }));
    }
  };

  const cambiarRol = async (id: string, nuevoRol: 'usuario' | 'vendedor'): Promise<void> => {
    try {
      setProcesando(prev => ({ ...prev, [id]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendedoractivo/${id}/rol`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nuevoRol })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar rol');
      }

      const data = await response.json();
      
      setVendedores(prev => 
        prev.map(v => v._id === id ? { ...v, rol: data.data.rol } : v)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error:', errorMessage);
      alert('Error al cambiar rol del usuario');
    } finally {
      setProcesando(prev => ({ ...prev, [id]: false }));
    }
  };

  const eliminarVendedor = async (id: string, nombre: string): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      return;
    }

    try {
      setProcesando(prev => ({ ...prev, [id]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendedoractivo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar vendedor');
      }

      await fetchVendedores(pagination.page);
      alert('Vendedor eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error:', errorMessage);
      alert('Error al eliminar vendedor');
    } finally {
      setProcesando(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const changePage = (newPage: number): void => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Cargando vendedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Vendedores</h1>
                <p className="text-blue-200">Administra usuarios y vendedores activos</p>
              </div>
            </div>
            <button
              onClick={() => fetchVendedores(pagination.page)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Usuarios</p>
                <p className="text-3xl font-bold">{pagination.total}</p>
              </div>
              <Users size={40} className="opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Vendedores</p>
                <p className="text-3xl font-bold">
                  {vendedores.filter(v => v.rol === 'vendedor').length}
                </p>
              </div>
              <ShoppingCart size={40} className="opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Congelados</p>
                <p className="text-3xl font-bold">
                  {vendedores.filter(v => v.isFrozen).length}
                </p>
              </div>
              <Snowflake size={40} className="opacity-50" />
            </div>
          </div>
        </div>

        {/* Grid de Vendedores 3x3 */}
        {vendedores.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
            <Users className="text-blue-400 mx-auto mb-4" size={64} />
            <p className="text-white text-xl">No hay vendedores registrados</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vendedores.map((vendedor) => (
                <div
                  key={vendedor._id}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all hover:shadow-xl hover:scale-105 ${
                    vendedor.isFrozen 
                      ? 'border-blue-400 bg-blue-500/10' 
                      : 'border-white/20'
                  }`}
                >
                  {/* Avatar y Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                      vendedor.rol === 'vendedor' ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {vendedor.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                        vendedor.rol === 'vendedor' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        {vendedor.rol}
                      </span>
                      {vendedor.isFrozen && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white flex items-center gap-1 justify-center">
                          <Snowflake size={12} />
                          Congelado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info del vendedor */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-3">{vendedor.nombre}</h3>
                    
                    <div className="space-y-2 text-sm text-blue-200">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="truncate">{vendedor.email}</span>
                      </div>
                      
                      {vendedor.whatsapp && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="flex-shrink-0" />
                          <span>{vendedor.whatsapp}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>Desde {formatDate(vendedor.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje si está congelado */}
                  {vendedor.isFrozen && (
                    <div className="mb-4 bg-blue-500/20 border border-blue-400 rounded-lg p-2 flex items-center gap-2">
                      <AlertCircle className="text-blue-400 flex-shrink-0" size={14} />
                      <p className="text-blue-200 text-xs">
                        No puede subir productos
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="space-y-2">
                    {/* Toggle Freeze */}
                    <button
                      onClick={() => toggleFreeze(vendedor._id)}
                      disabled={procesando[vendedor._id]}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        vendedor.isFrozen
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {vendedor.isFrozen ? <Sun size={16} /> : <Snowflake size={16} />}
                      {vendedor.isFrozen ? 'Descongelar' : 'Congelar'}
                    </button>

                    {/* Cambiar Rol */}
                    <button
                      onClick={() => cambiarRol(
                        vendedor._id, 
                        vendedor.rol === 'vendedor' ? 'usuario' : 'vendedor'
                      )}
                      disabled={procesando[vendedor._id]}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        vendedor.rol === 'vendedor'
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {vendedor.rol === 'vendedor' ? <UserX size={16} /> : <UserCheck size={16} />}
                      {vendedor.rol === 'vendedor' ? 'Hacer Usuario' : 'Hacer Vendedor'}
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => eliminarVendedor(vendedor._id, vendedor.nombre)}
                      disabled={procesando[vendedor._id]}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-blue-200">
                    Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>
                    
                    <div className="flex gap-2">
                      {[...Array(pagination.pages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrentPage = pageNum === pagination.page;
                        const showPage = 
                          pageNum === 1 || 
                          pageNum === pagination.pages || 
                          Math.abs(pageNum - pagination.page) <= 1;
                        
                        if (!showPage) {
                          if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                            return <span key={pageNum} className="text-white px-2">...</span>;
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => changePage(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              isCurrentPage
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendedorActivoPage;