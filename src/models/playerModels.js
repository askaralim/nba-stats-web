/**
 * Player Data Models
 * Type definitions for player-related API responses
 */

/**
 * @typedef {Object} PlayerDetails
 * @property {string} id - Player ID
 * @property {string} name - Player display name
 * @property {string|null} photo - Player headshot URL
 * @property {PlayerTeam|null} team - Current team info
 * @property {string|null} jersey - Jersey number
 * @property {string|null} position - Player position
 * @property {string|null} height - Display height
 * @property {string|null} weight - Display weight
 * @property {string|null} dob - Date of birth
 * @property {number|null} age - Player age
 * @property {string|null} college - College name
 * @property {string|null} draft - Draft information
 * @property {string|null} experience - Years of experience
 * @property {boolean|null} active - Active status
 */

/**
 * @typedef {Object} PlayerTeam
 * @property {string} id - Team ID
 * @property {string} name - Team display name
 * @property {string} abbreviation - Team abbreviation
 * @property {string|null} logo - Team logo URL
 */

/**
 * @typedef {Object} CurrentSeasonStats
 * @property {string} season - Season display name
 * @property {Object<string, string|number>} stats - Flattened stats object (key: stat name, value: stat value)
 */

/**
 * @typedef {Object} RegularSeasonStats
 * @property {string[]} labels - Translated stat labels
 * @property {string[]} names - Stat names (keys)
 * @property {string[]} displayNames - Display names
 * @property {SeasonStatistic[]} statistics - Array of season statistics
 * @property {string[]|number[]} totals - Career totals
 */

/**
 * @typedef {Object} SeasonStatistic
 * @property {string} season - Season display name
 * @property {string[]|number[]} stats - Stat values for this season
 */

/**
 * @typedef {Object} AdvancedStats
 * @property {string[]} labels - Translated stat labels
 * @property {string[]} names - Stat names (keys)
 * @property {string[]} displayNames - Display names
 * @property {SeasonStatistic[]} statistics - Array of season statistics
 * @property {GlossaryItem[]} glossary - Glossary of advanced stat terms
 */

/**
 * @typedef {Object} GlossaryItem
 * @property {string} abbreviation - Stat abbreviation
 * @property {string} displayName - Translated display name
 */

/**
 * @typedef {Object} Last5Games
 * @property {string[]} labels - Translated stat labels
 * @property {string[]} names - Stat names (keys)
 * @property {string[]} displayNames - Display names
 * @property {GameEvent[]} events - Last 5 game events
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} eventId - Game event ID
 * @property {string[]|number[]} stats - Stat values for this game
 * @property {string|null} gameDate - Game date
 * @property {string|null} score - Game score
 * @property {string|null} gameResult - W or L
 * @property {Object|null} opponent - Opponent team info
 * @property {string|null} atVs - @ or vs
 * @property {string|null} homeTeamId - Home team ID
 * @property {string|null} awayTeamId - Away team ID
 * @property {number|null} homeTeamScore - Home team score
 * @property {number|null} awayTeamScore - Away team score
 */

/**
 * @typedef {Object} PlayerBio
 * @property {Object} [awards] - Awards information
 * @property {Object} [other] - Other bio information
 * Note: teamHistory is excluded as it's irrelevant
 */

export {};

