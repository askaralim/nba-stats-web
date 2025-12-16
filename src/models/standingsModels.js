/**
 * Standings Data Models
 * Type definitions for standings-related API responses
 */

/**
 * @typedef {Object} StandingsData
 * @property {number} season - Season year
 * @property {number} seasonType - Season type (2=Regular, 3=Playoffs)
 * @property {Object<string, Conference>} conferences - Conferences object (key: conference abbreviation)
 */

/**
 * @typedef {Object} Conference
 * @property {string} id - Conference ID
 * @property {string} name - Conference name
 * @property {string} abbreviation - Conference abbreviation
 * @property {number} season - Season year
 * @property {number} seasonType - Season type
 * @property {string} seasonDisplayName - Season display name (e.g., "2025-26")
 * @property {Team[]} teams - Array of teams in this conference
 */

/**
 * @typedef {Object} Team
 * @property {string} id - Team ID
 * @property {string} uid - Team UID
 * @property {string} name - Team display name
 * @property {string} shortName - Team short display name
 * @property {string} abbreviation - Team abbreviation
 * @property {string} location - Team location
 * @property {string|null} logo - Team logo URL
 * @property {number|null} wins - Wins
 * @property {number|null} losses - Losses
 * @property {number|null} winPercent - Win percentage
 * @property {number|null} playoffSeed - Playoff seed
 * @property {number|null} gamesBehind - Games behind
 * @property {number|null} homeWins - Home wins
 * @property {number|null} homeLosses - Home losses
 * @property {number|null} awayWins - Away wins
 * @property {number|null} awayLosses - Away losses
 * @property {number|null} streak - Streak number
 * @property {string|null} streakType - Streak type (e.g., "W3", "L2")
 */

export {};

