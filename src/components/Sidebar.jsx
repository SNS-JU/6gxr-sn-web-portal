import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo6G from '../assets/6g-xr-logo-white.png';

function Sidebar() {
  const location = useLocation(); // Para destacar la ruta activa

  return (
    <div className="w-64 h-screen bg-gradient-to-r from-[#594974] to-[#88526F] text-white flex flex-col">
      {/* Logotipo de 6G-XR */}
      <div className="flex items-center justify-center h-20 mt-4">
        <img src={logo6G} alt="6G XR Logo" className="h-24 mx-auto" />
      </div>

      {/* Menú de navegación */}
      <nav className="flex-grow p-4 space-y-2">
        {/* Dashboard */}
        <Link to="/dashboard" className={`block p-2 rounded-md font-bold text-lg ${location.pathname === '/' ? 'bg-gray-700' : ''}`}>
          Dashboard
        </Link>

        {/* NST Section */}
        <div>
          <Link to="/nst" className={`block p-2 rounded-md font-bold text-lg ${location.pathname === '/nst' ? 'bg-gray-700' : ''}`}>
            NST
          </Link>
        </div>
      </nav>

      {/* Sección de Perfil */}
      <div className="p-4 ">
        <div className="flex items-center space-x-3">
          <img
            src="https://i.pravatar.cc/40?img=58" 
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-bold text-lg">6G-XR User</p>
            <p className="text-sm text-gray-300">6gxruser@6gxr.com</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4">
        <Link
          to="/login"
          className="block p-2 text-center text-tertiary font-bold text-lg bg-white rounded-md"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
