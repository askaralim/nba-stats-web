/**
 * Team Data Models
 * Type definitions and data structures for team-related data
 */

/**
 * Team Leader Model
 * @typedef {Object} TeamLeader
 * @property {string} id - Player ID
 * @property {string} name - Player name
 * @property {string} position - Player position abbreviation
 * @property {string} jersey - Jersey number
 * @property {string|null} headshot - Player headshot URL
 * @property {string} mainStat - Main statistic value (e.g., "29.6" for PPG)
 * @property {Object<string, string>} additionalStats - Additional stats (e.g., { avgMinutes: "31.3", fieldGoalPct: "48.4" })
 */

/**
 * Team Leaders Model
 * @typedef {Object} TeamLeaders
 * @property {Object} offense
 * @property {TeamLeader|null} offense.points - Points per game leader
 * @property {TeamLeader|null} offense.assists - Assists per game leader
 * @property {TeamLeader|null} offense.fieldGoalPct - Field goal percentage leader
 * @property {Object} defense
 * @property {TeamLeader|null} defense.rebounds - Rebounds per game leader
 * @property {TeamLeader|null} defense.steals - Steals per game leader
 * @property {TeamLeader|null} defense.blocks - Blocks per game leader
 */

/**
 * Game Team Model
 * @typedef {Object} GameTeam
 * @property {string} name - Team name
 * @property {string} abbreviation - Team abbreviation
 * @property {string} [score] - Score (for completed games)
 */

/**
 * Recent Game Model
 * @typedef {Object} RecentGame
 * @property {string} id - Game ID
 * @property {string} date - Game date (ISO string)
 * @property {GameTeam} homeTeam - Home team info
 * @property {GameTeam} awayTeam - Away team info
 * @property {boolean|null} [won] - Whether team won (for completed games)
 * @property {string} status - Game status (e.g., "Completed", "Scheduled")
 */

/**
 * Recent Games Model
 * @typedef {Object} RecentGames
 * @property {RecentGame[]} last5Games - Last 5 completed games
 * @property {RecentGame[]} next3Games - Next 3 upcoming games
 */

/**
 * Team Stats Model
 * @typedef {Object} TeamStats
 * @property {string} gamesPlayed - Games played
 * @property {string} avgPoints - Average points per game
 * @property {string} avgRebounds - Average rebounds per game
 * @property {string} avgAssists - Average assists per game
 * @property {string} avgSteals - Average steals per game
 * @property {string} avgBlocks - Average blocks per game
 * @property {string} avgTurnovers - Average turnovers per game
 * @property {string} avgFouls - Average fouls per game
 * @property {string} fieldGoalPct - Field goal percentage
 * @property {string} threePointPct - Three point percentage
 * @property {string} freeThrowPct - Free throw percentage
 * @property {string} assistTurnoverRatio - Assist to turnover ratio
 */

/**
 * Player Stat Model
 * @typedef {Object} PlayerStat
 * @property {string} id - Player ID
 * @property {string} name - Player name
 * @property {string} position - Position abbreviation
 * @property {Object<string, string>} stats - Player statistics
 */

/**
 * Team Details Model
 * @typedef {Object} TeamDetails
 * @property {Object} team - Team basic info
 * @property {string} team.id - Team ID
 * @property {string} team.name - Team name
 * @property {string} team.abbreviation - Team abbreviation
 * @property {string|null} team.logo - Team logo URL
 * @property {string|null} team.record - Win-loss record
 * @property {string|null} team.standingSummary - Standing summary
 * @property {TeamStats} teamStats - Team statistics
 * @property {PlayerStat[]} players - Player statistics
 */

export {};

