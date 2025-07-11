import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo6G from '../assets/6g-xr-logo.png';
import authService from '../services/authService'; // Import the authService
import Cookies from 'js-cookie';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Obtener parámetros de la URL

  useEffect(() => {
    const trialID = searchParams.get("trial"); // Extract "trial" from params
    if (trialID) {
      localStorage.setItem("trialId", trialID); // Save on localStorage
      console.log("Trial ID guardado:", trialID);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      // Call the login function from authService
      const session = await authService.login(email, password);
      const sessionId = session.sessionId;
+     Cookies.set("sessionId", sessionId, { expires: 1 });

      // Save sessionId (optional, depending on your app's needs)
      console.log('Session ID:', sessionId);

      // Redirect to the home page after successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.'); // Display error message
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-r from-[#594974] to-[#88526F]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <img src={logo6G} alt="6G XR Logo" className="h-48 mx-auto" />
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 mt-2 border rounded-md"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-2 mt-2 border rounded-md"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white p-2 rounded-md font-bold ${isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-tertiary hover:bg-secondary'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm">Don't have an account? <a href="/register" className="text-tertiary font-bold hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
