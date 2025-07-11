/**
 * SNA Service for South Node Adapter 6G-XR
 *
 * This service provides methods for interacting with the South Node Adapter's
 * functionalities, including retrieving applications, slices, experiments,
 * and GPSI. It uses the South Node Adapter API as the base URL.
 * 
 * South Node Adapter: http://10.15.125.12:8080
 * 
 * Endpoints:
 * - /applications: Retrieve application details
 * - /gpsis: Retrieve GPSI list of supported UEs
 * - /slices: Retrieve TC slice ids list
 * - /experiment: Query and manage network service templates
 * - /experiment/{experimentName}: Query and terminate an experiment
 * - /experiment/run/{experimentName}: Start an experiment
 * - /experiment/terminate/{experimentName}: Terminate an experiment
 *
 * This service makes HTTP requests using the Fetch API.
 */

// const SNA_BASE_URL = "http://localhost:3001/south-node-adapter/v3"; // Actual SNA server URL
   const SNA_BASE_URL = import.meta.env.VITE_SNA_BASE_URL;

/**
 * Retrieve all applications
 * @param {string} sessionId - The session ID for authentication
 * @returns {Promise<Array>} List of applications
 */
export async function getApplications(sessionId) {
  return fetchData("/applications", sessionId);
}

/**
 * Retrieve GPSI list of supported UEs
 * @param {string} sessionId - The session ID for authentication
 * @returns {Promise<Array>} List of GPSI values
 */
export async function getGpsis(sessionId) {
  return fetchData("/gpsis", sessionId);
}

/**
 * Retrieve TC slice ids list
 * @param {string} sessionId - The session ID for authentication
 * @returns {Promise<Array>} List of TC slice ids
 */
export async function getSlices(sessionId) {
  return fetchData("/slices", sessionId);
}

/**
 * Retrieve all experiments
 * @param {string} sessionId - The session ID for authentication
 * @returns {Promise<Array>} List of experiments
 */
export async function getExperiments(sessionId) {
  return fetchData("/experiment", sessionId);
}

/**
 * Create and save an experiment
 * @param {string} sessionId - The session ID for authentication
 * @param {Object} experimentData - The experiment details
 * @returns {Promise<Object>} The response from the experiment creation
 */
export async function createExperiment(sessionId, experimentData) {
  return sendData("/experiment", sessionId, "POST", experimentData);
}

/**
 * Delete an experiment from the database
 * @param {string} sessionId - The session ID for authentication
 * @param {string} experimentName - The name of the experiment to delete
 * @returns {Promise<string>} Confirmation of experiment deletion
 */
export async function deleteExperiment(sessionId, experimentName) {
  return sendData(`/experiment/${experimentName}`, sessionId, "DELETE");
}

/**
 * Query experiment status by experiment name
 * @param {string} sessionId - The session ID for authentication
 * @param {string} experimentName - The experiment name
 * @returns {Promise<Object>} The experiment status
 */
export async function getExperimentStatus(sessionId, experimentName) {
  return fetchData(`/experiment/${experimentName}`, sessionId);
}

/**
 * Start an experiment
 * @param {string} sessionId - The session ID for authentication
 * @param {string} experimentName - The experiment name
 * @returns {Promise<Object>} Response from launching the experiment
 */
export async function runExperiment(sessionId, experimentName) {
  return sendData(`/experiment/run/${experimentName}`, sessionId, "POST");
}

/**
 * Terminate an experiment by experiment name
 * @param {string} sessionId - The session ID for authentication
 * @param {string} experimentName - The experiment name
 * @returns {Promise<string>} Confirmation of experiment termination
 */
export async function terminateExperiment(sessionId, experimentName) {
  return sendData(`/experiment/terminate/${experimentName}`, sessionId, "DELETE");
}

/**
 * Helper function to fetch data from the API
 * @param {string} endpoint - API endpoint
 * @param {string} sessionId - The session ID for authentication
 * @returns {Promise<any>} API response
 */
async function fetchData(endpoint, sessionId) {
  const url = `${SNA_BASE_URL}${endpoint}`;
  const params = new URLSearchParams({ sessionId });

  try {
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Helper function to send data to the API
 * @param {string} endpoint - API endpoint
 * @param {string} sessionId - The session ID for authentication
 * @param {string} method - HTTP method (POST, DELETE)
 * @param {Object} [data] - Request body data (if applicable)
 * @returns {Promise<any>} API response
 */
async function sendData(endpoint, sessionId, method, data = null) {
  const url = `${SNA_BASE_URL}${endpoint}`;
  const params = new URLSearchParams({ sessionId });

  try {
    const response = await fetch(`${url}?${params}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      throw new Error(`Failed to ${method} ${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    throw error;
  }
}

export default {
  getApplications,
  getGpsis,
  getSlices,
  getExperiments,
  createExperiment,
  deleteExperiment,
  getExperimentStatus,
  runExperiment,
  terminateExperiment,
};
