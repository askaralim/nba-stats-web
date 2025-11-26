/**
 * Application configuration
 * Uses environment variables for different environments
 */

// API base URL - defaults to localhost for development
// In production, set VITE_API_URL environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

