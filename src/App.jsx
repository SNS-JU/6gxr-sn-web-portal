import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NSTList from './pages/NSTList.jsx';
import NSTForm from './pages/NSTForm.jsx'; 
import Login from './pages/Login.jsx';  
import Register from './pages/Register.jsx';  

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<CenteredLayout><Login /></CenteredLayout>} />
          <Route path="/register" element={<CenteredLayout><Register /></CenteredLayout>} />
           {/* Redirección predeterminada a /login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </div>
    </Router>
  );
}

function CenteredLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {children}
    </div>
  );
}

function MainApp() {
  return (
    <div className="flex">
      <Sidebar /> {/* El Sidebar siempre se muestra */}
      <div className="flex-grow p-6">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nst" element={<NSTList />} />
          <Route path="/nst/create" element={<NSTForm />} />
          <Route path="/nst/edit/:id" element={<NSTForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
