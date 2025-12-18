/**
 * Mock Data Service
 * Provides mock API responses for local testing
 * Only active when VITE_USE_MOCK_DATA=true in development
 */

import { getMockGames, getMockHomeData } from './mockGameData';

/**
 * Mock fetch wrapper for games endpoint
 * @param {string} url - API URL
 * @returns {Promise<Response>} Mock response
 */
export async function mockFetchGames(url) {
  if (url.includes('/api/nba/games/today')) {
    const data = await getMockGames();
    return {
      ok: true,
      json: async () => data
    };
  }
  
  // Return error for other endpoints
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found (Mock)'
  };
}

/**
 * Mock fetch wrapper for home endpoint
 * @param {string} url - API URL
 * @returns {Promise<Response>} Mock response
 */
export async function mockFetchHome(url) {
  if (url.includes('/api/nba/home')) {
    const data = await getMockHomeData();
    return {
      ok: true,
      json: async () => data
    };
  }
  
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found (Mock)'
  };
}

/**
 * Enhanced fetch function that uses mock data when enabled
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Response (mock or real)
 */
export async function enhancedFetch(url, options = {}) {
  // Check if mock data is enabled
  const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV;
  
  if (!USE_MOCK_DATA) {
    // Use real API
    return fetch(url, options);
  }
  
  // Use mock data
  console.log(`[MOCK DATA] Fetching: ${url}`);
  
  if (url.includes('/api/nba/games/today')) {
    return mockFetchGames(url);
  }
  
  if (url.includes('/api/nba/home')) {
    return mockFetchHome(url);
  }
  
  // For other endpoints, use real API
  return fetch(url, options);
}

export default {
  enhancedFetch,
  mockFetchGames,
  mockFetchHome
};


