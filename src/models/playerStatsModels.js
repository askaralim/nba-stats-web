/**
 * Player Stats Data Models
 * Type definitions for player statistics data structures
 */

/**
 * @typedef {Object} PlayerStat
 * @property {number|null} value - Raw stat value
 * @property {number|null} rank - Stat rank
 * @property {string} displayValue - Formatted display value (e.g., "25.5", "45.2%")
 * @property {string|null} label - Stat label
 * @property {string|null} displayName - Stat display name
 * @property {string|null} description - Stat description
 * @property {string|null} category - Stat category (general, offensive, defensive)
 */

/**
 * @typedef {Object} MinimizedPlayer
 * @property {string|null} id - Player ID
 * @property {string} name - Player full name
 * @property {string} position - Player position abbreviation
 * @property {string} team - Team name
 * @property {string|null} teamLogo - Team logo URL
 * @property {string|null} headshot - Player headshot URL
 * @property {number} statRank - Rank for this specific stat
 * @property {Object<string, PlayerStat>} stats - Only includes the specific stat and gamesPlayed
 */

/**
 * @typedef {Object} TopPlayersCategory
 * @property {string} title - Category title (e.g., "场均得分")
 * @property {string} description - Category description (e.g., "Points Per Game")
 * @property {Array<MinimizedPlayer>} players - Top players for this stat (minimized data)
 */

/**
 * @typedef {Object} PlayerStatsMetadata
 * @property {string} season - Season string (e.g., "2025-2026")
 * @property {string} seasonType - Season type ("Regular Season" or "Postseason")
 * @property {number} seasonTypeId - Season type ID (2=Regular, 3=Postseason)
 * @property {string} position - Position filter
 * @property {number} totalCount - Total number of players
 */

/**
 * @typedef {Object} PlayerStatsResponse
 * @property {PlayerStatsMetadata} metadata - Response metadata (minimal)
 * @property {Object<string, TopPlayersCategory>} topPlayersByStat - Top players by stat category (only what's needed)
 */

export {};

