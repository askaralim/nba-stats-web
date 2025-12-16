/**
 * Game Data Models
 * Type definitions for game-related data structures
 */

/**
 * @typedef {Object} MinimizedTeam
 * @property {string} teamName - Team name
 * @property {string} teamCity - Team city
 * @property {string} abbreviation - Team abbreviation
 * @property {string} logo - Team logo URL
 * @property {number} wins - Team wins
 * @property {number} losses - Team losses
 * @property {number|null} score - Team score (null if not started)
 */

/**
 * @typedef {Object} MinimizedGame
 * @property {string} gameId - Game ID
 * @property {number} gameStatus - Game status (1=Scheduled, 2=Live, 3=Final)
 * @property {string} gameStatusText - Status text
 * @property {string|null} gameEt - Game time (ISO string)
 * @property {MinimizedTeam} awayTeam - Away team data
 * @property {MinimizedTeam} homeTeam - Home team data
 */

/**
 * @typedef {Object} GameTeam
 * @property {string} teamId - Team ID
 * @property {string} teamName - Team name
 * @property {string} teamCity - Team city
 * @property {string} teamTricode - Team abbreviation
 * @property {string} teamLogo - Team logo URL
 * @property {number} wins - Team wins
 * @property {number} losses - Team losses
 * @property {number|null} score - Team score
 * @property {Array<Object>} periods - Period scores
 */

/**
 * @typedef {Object} PlayerStat
 * @property {string} minutes - Minutes played
 * @property {number} points - Points
 * @property {string} fieldGoals - Field goals (made-attempted)
 * @property {string} threePointers - Three pointers (made-attempted)
 * @property {string} freeThrows - Free throws (made-attempted)
 * @property {number} rebounds - Total rebounds
 * @property {number} assists - Assists
 * @property {number} turnovers - Turnovers
 * @property {number} steals - Steals
 * @property {number} blocks - Blocks
 * @property {number} offensiveRebounds - Offensive rebounds
 * @property {number} defensiveRebounds - Defensive rebounds
 * @property {number} fouls - Fouls
 * @property {number} plusMinus - Plus/minus
 */

/**
 * @typedef {Object} BoxscorePlayer
 * @property {string} athleteId - Player ID
 * @property {string} name - Player name
 * @property {string} shortName - Player short name
 * @property {string} jersey - Jersey number
 * @property {string} position - Player position
 * @property {string|null} headshot - Player headshot URL
 * @property {boolean} starter - Is starter
 * @property {boolean} didNotPlay - Did not play
 * @property {string|null} reason - Reason for not playing
 * @property {PlayerStat} stats - Player statistics
 */

/**
 * @typedef {Object} TopPerformers
 * @property {Array<BoxscorePlayer>} points - Top point scorers
 * @property {Array<BoxscorePlayer>} rebounds - Top rebounders
 * @property {Array<BoxscorePlayer>} assists - Top assist leaders
 * @property {Array<BoxscorePlayer>} plusMinus - Top plus/minus
 * @property {Array<BoxscorePlayer>} steals - Top steal leaders
 * @property {Array<BoxscorePlayer>} blocks - Top block leaders
 */

/**
 * @typedef {Object} BoxscoreTeam
 * @property {string} teamId - Team ID
 * @property {string} teamName - Team name
 * @property {string} teamAbbreviation - Team abbreviation
 * @property {string} teamLogo - Team logo URL
 * @property {string} homeAway - Home or away
 * @property {Array<BoxscorePlayer>} starters - Starting players
 * @property {Array<BoxscorePlayer>} bench - Bench players
 * @property {Array<BoxscorePlayer>} didNotPlay - Players who didn't play
 * @property {TopPerformers} topPerformers - Pre-calculated top performers
 */

/**
 * @typedef {Object} GameBoxscore
 * @property {Array<BoxscoreTeam>} teams - Teams with player data
 */

/**
 * @typedef {Object} GameDetails
 * @property {string} gameId - Game ID
 * @property {string} gameCode - Game code
 * @property {string} gameStatusText - Status text
 * @property {number} gameStatus - Game status (1=Scheduled, 2=Live, 3=Final)
 * @property {number} period - Current period
 * @property {string} gameClock - Game clock
 * @property {string|null} gameTimeGMT - Game time in GMT
 * @property {string|null} gameEt - Game time (ISO string)
 * @property {GameTeam} homeTeam - Home team data
 * @property {GameTeam} awayTeam - Away team data
 * @property {Object|null} gameLeaders - Game leaders
 * @property {GameBoxscore|null} boxscore - Boxscore data (if available)
 */

/**
 * @typedef {Object} GamesTodayResponse
 * @property {string} date - Date string
 * @property {number} totalGames - Total number of games
 * @property {Array<MinimizedGame>} games - Array of minimized games
 */

export {};

