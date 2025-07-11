/**
 * UWP Service for Unified Web Portal 6G-XR
 *
 * This service provides methods for interacting with the Unified Web Portal's
 * functionalities, including retrieving Trial IDs. It uses the Unified Web Portal API
 * as the base URL.
 * 
 * Unified Web Portal: http://localhost:3002/unified-web-portal
 * 
 * Endpoints:
 * - /trial: Retrieve list of Trial IDs
 *
 * This service makes HTTP requests using the Fetch API.
 */

// const UWP_BASE_URL = " http://193.166.32.46/"; // Actual UWP server URL
// const UWP_BASE_URL = "http://localhost:3002/unified-web-portal"; // Mock or development endpoint
   const UWP_BASE_URL = import.meta.env.VITE_UWP_BASE_URL;

/**
 * Retrieve Trial IDs or a specific Trial by its number
 * @param {string} [trialNumber] - The trial number to fetch (optional)
 * @returns {Promise<Array|Object>} List of Trial IDs or a single Trial object
 */
export async function getTrialIds(trialNumber) {
  const url = trialNumber ? `${UWP_BASE_URL}/trials/${trialNumber}` : `${UWP_BASE_URL}/trials`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch trials: ${response.statusText}`);
    }

    const trialIds = await response.json();
    console.log(`Response: ${trialIds}`)
    return trialIds;
  } catch (error) {
    console.error("Error fetching trials:", error);
    throw error;
  }
}

export default {
  getTrialIds
};
