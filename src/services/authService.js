/**
 * Auth Service for South Node Adapter 6G-XR
 *
 * This service provides methods for user authentication and registration
 * using the South Node Adapter available at the following base URL:
 * 
 * South Node Adapter: http://10.15.125.12:8080
 * 
 * Endpoints:
 * - Register: http://10.15.125.12:8080/register
 *   Use this endpoint to register new users in the system.
 * 
 * - Login: http://10.15.125.12:8080/login
 *   Use this endpoint to log in and retrieve the session ID required
 *   for subsequent requests.
 * 
 * This service makes HTTP requests using the Fetch API.
 */


// const SNA_BASE_URL = "http://10.15.125.12:8080";
// const SNA_BASE_URL = "http://localhost:3001/south-node-adapter/v3"  // Mockoon endpoint with 3.1.0 swagger data
   const SNA_BASE_URL = import.meta.env.VITE_SNA_BASE_URL;

/**
 * Register a new user
 * @param {string} user - The username
 * @param {string} password - The password
 * @param {string} appProviderId - The App Provider ID
 * @returns {Promise<Response>} Response object
 */
export async function register(user, password, appProviderId) {
  const url = `${SNA_BASE_URL}/register`;
  const params = new URLSearchParams({ user, password, appProviderId });

  try {
    const response = await fetch(`${url}?${params}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to register: ${response.statusText}`);
    }

    // Intenta procesar la respuesta como JSON, pero maneja casos de respuestas vacías
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

/**
 * De-register a user
 * @param {string} user - The username
 * @param {string} password - The password
 * @param {string} appProviderId - The App Provider ID
 * @returns {Promise<Response>} Response object
 */
export async function deregister(user, password, appProviderId) {
  const url = `${SNA_BASE_URL}/register`;
  const params = new URLSearchParams({ user, password, appProviderId });

  const response = await fetch(`${url}?${params}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to de-register: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Login a user
 * @param {string} user - The username
 * @param {string} password - The password
 * @returns {Promise<string>} Session ID
 */
export async function login(user, password) {
  const url = `${SNA_BASE_URL}/login`;
  const params = new URLSearchParams({ user, password });

  const response = await fetch(`${url}?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const sessionId = await response.json();
  return sessionId;
}

/**
 * Logout a user
 * @param {string} sessionId - The session ID
 * @returns {Promise<Response>} Response object
 */
export async function logout(sessionId) {
  const url = `${SNA_BASE_URL}/login`;
  const params = new URLSearchParams({ sessionId });

  const response = await fetch(`${url}?${params}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to logout: ${response.statusText}`);
  }

  return response.json();
}

export default {
    register,
    deregister,
    login,
    logout,
  };
  