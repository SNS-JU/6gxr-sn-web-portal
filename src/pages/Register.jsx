import React, { useState } from 'react';
import logo6G from '../assets/6g-xr-logo.png';
import authService from '../services/authService'; // Import the authService
import { useNavigate } from 'react-router-dom'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appProviderId, setAppProviderId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate(); // Initialize navigate

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setSuccessMessage('');
      return;
    }

    setIsLoading(true); // Start loading
    try {
      const response = await authService.register(email, password, appProviderId); // Use authService to call register
      setSuccessMessage('Registration successful!');
      setErrorMessage('');
      console.log('Response:', response);
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 3500); // 3.5 seconds delay for better UX before redirection
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed');
      setSuccessMessage('');
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-r from-[#594974] to-[#88526F]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <img src={logo6G} alt="6G XR Logo" className="h-48 mx-auto" />
        <form onSubmit={handleRegister}>
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
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
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
            <div className="w-1/2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-2 mt-2 border rounded-md"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="appproviderid" className="block text-sm font-medium text-gray-700">App Provider ID</label>
            <input
              type="text"
              id="appproviderid"
              className="w-full p-2 mt-2 border rounded-md"
              placeholder="Your app provider ID"
              value={appProviderId}
              onChange={(e) => setAppProviderId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 text-white rounded-md font-bold ${isLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-tertiary hover:bg-secondary'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Sign up'}
          </button>
        </form>
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center mt-4">{successMessage}</p>
        )}
        <div className="mt-4 text-center">
          <p className="text-sm">Already have an account? <a href="/login" className="text-tertiary font-bold hover:underline">Log in</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
