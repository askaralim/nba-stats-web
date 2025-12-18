/**
 * Mock Game Data for Local Testing
 * Only used when VITE_USE_MOCK_DATA=true
 * 
 * This file contains mock game data with different statuses for testing:
 * - Scheduled games (status 1)
 * - Live games (status 2)
 * - Final games (status 3)
 * - Overtime games
 * - Close games (<=5 points difference)
 * - Marquee matchups
 */

const mockGames = [
  // Scheduled Game
  {
    gameId: 'mock-001',
    gameStatus: 1,
    gameStatusText: 'Scheduled',
    gameEt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    period: 0,
    awayTeam: {
      teamName: 'Lakers',
      teamCity: 'Los Angeles',
      abbreviation: 'LAL',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png',
      wins: 24,
      losses: 1,
      score: null
    },
    homeTeam: {
      teamName: 'Warriors',
      teamCity: 'Golden State',
      abbreviation: 'GSW',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gs.png',
      wins: 20,
      losses: 5,
      score: null
    }
  },
  
  // Live Game - Close Score
  {
    gameId: 'mock-002',
    gameStatus: 2,
    gameStatusText: 'Q4 2:34',
    gameEt: new Date().toISOString(),
    period: 4,
    awayTeam: {
      teamName: 'Celtics',
      teamCity: 'Boston',
      abbreviation: 'BOS',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png',
      wins: 25,
      losses: 0,
      score: 98
    },
    homeTeam: {
      teamName: 'Heat',
      teamCity: 'Miami',
      abbreviation: 'MIA',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png',
      wins: 18,
      losses: 7,
      score: 95
    }
  },
  
  // Final Game - Close Score (Exciting)
  {
    gameId: 'mock-003',
    gameStatus: 3,
    gameStatusText: 'Final',
    gameEt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    period: 4,
    awayTeam: {
      teamName: 'Spurs',
      teamCity: 'San Antonio',
      abbreviation: 'SA',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sa.png',
      wins: 15,
      losses: 10,
      score: 113
    },
    homeTeam: {
      teamName: 'Knicks',
      teamCity: 'New York',
      abbreviation: 'NYK',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/ny.png',
      wins: 19,
      losses: 6,
      score: 118
    }
  },
  
  // Overtime Game
  {
    gameId: 'mock-004',
    gameStatus: 3,
    gameStatusText: 'Final/OT',
    gameEt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    period: 5,
    awayTeam: {
      teamName: 'Nuggets',
      teamCity: 'Denver',
      abbreviation: 'DEN',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/den.png',
      wins: 22,
      losses: 3,
      score: 127
    },
    homeTeam: {
      teamName: 'Suns',
      teamCity: 'Phoenix',
      abbreviation: 'PHX',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/phx.png',
      wins: 17,
      losses: 8,
      score: 125
    }
  },
  
  // Final Game - Very Close (2 points)
  {
    gameId: 'mock-005',
    gameStatus: 3,
    gameStatusText: 'Final',
    gameEt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    period: 4,
    awayTeam: {
      teamName: 'Bucks',
      teamCity: 'Milwaukee',
      abbreviation: 'MIL',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mil.png',
      wins: 21,
      losses: 4,
      score: 105
    },
    homeTeam: {
      teamName: '76ers',
      teamCity: 'Philadelphia',
      abbreviation: 'PHI',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/phil.png',
      wins: 20,
      losses: 5,
      score: 103
    }
  },
  
  // Live Game - Blowout
  {
    gameId: 'mock-006',
    gameStatus: 2,
    gameStatusText: 'Q3 5:12',
    gameEt: new Date().toISOString(),
    period: 3,
    awayTeam: {
      teamName: 'Thunder',
      teamCity: 'Oklahoma City',
      abbreviation: 'OKC',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/okc.png',
      wins: 23,
      losses: 2,
      score: 85
    },
    homeTeam: {
      teamName: 'Pistons',
      teamCity: 'Detroit',
      abbreviation: 'DET',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/det.png',
      wins: 5,
      losses: 20,
      score: 62
    }
  },
  
  // Scheduled Game - Marquee Matchup
  {
    gameId: 'mock-007',
    gameStatus: 1,
    gameStatusText: 'Scheduled',
    gameEt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    period: 0,
    awayTeam: {
      teamName: 'Lakers',
      teamCity: 'Los Angeles',
      abbreviation: 'LAL',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png',
      wins: 24,
      losses: 1,
      score: null
    },
    homeTeam: {
      teamName: 'Celtics',
      teamCity: 'Boston',
      abbreviation: 'BOS',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png',
      wins: 25,
      losses: 0,
      score: null
    }
  },
  
  // Final Game - Normal Score Difference
  {
    gameId: 'mock-008',
    gameStatus: 3,
    gameStatusText: 'Final',
    gameEt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    period: 4,
    awayTeam: {
      teamName: 'Rockets',
      teamCity: 'Houston',
      abbreviation: 'HOU',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/hou.png',
      wins: 12,
      losses: 13,
      score: 98
    },
    homeTeam: {
      teamName: 'Mavericks',
      teamCity: 'Dallas',
      abbreviation: 'DAL',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/dal.png',
      wins: 16,
      losses: 9,
      score: 112
    }
  },
  
  // Live Game - Tied
  {
    gameId: 'mock-009',
    gameStatus: 2,
    gameStatusText: 'Q4 0:45',
    gameEt: new Date().toISOString(),
    period: 4,
    awayTeam: {
      teamName: 'Clippers',
      teamCity: 'LA',
      abbreviation: 'LAC',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lac.png',
      wins: 19,
      losses: 6,
      score: 108
    },
    homeTeam: {
      teamName: 'Jazz',
      teamCity: 'Utah',
      abbreviation: 'UTA',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/utah.png',
      wins: 14,
      losses: 11,
      score: 108
    }
  },
  
  // Final Game - 1 Point Difference (Most Exciting)
  {
    gameId: 'mock-010',
    gameStatus: 3,
    gameStatusText: 'Final',
    gameEt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    period: 4,
    awayTeam: {
      teamName: 'Bulls',
      teamCity: 'Chicago',
      abbreviation: 'CHI',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/chi.png',
      wins: 16,
      losses: 9,
      score: 106
    },
    homeTeam: {
      teamName: 'Cavaliers',
      teamCity: 'Cleveland',
      abbreviation: 'CLE',
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cle.png',
      wins: 18,
      losses: 7,
      score: 107
    }
  }
];

/**
 * Get mock games response with featured games
 * @param {string} date - Date parameter (not used in mock, but kept for API compatibility)
 * @returns {Promise<Object>} Mock games response
 */
export function getMockGames(date = null) {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Identify featured games (same logic as backend)
      const completedGames = mockGames.filter(g => g.gameStatus === 3);
      const liveGames = mockGames.filter(g => g.gameStatus === 2);
      
      const featured = [];
      const other = [];
      
      // Priority 1: Overtime games
      const otGames = completedGames.filter(g => g.period > 4 || g.gameStatusText?.includes('OT'));
      otGames.forEach(game => {
        if (!featured.find(f => f.gameId === game.gameId)) {
          featured.push({ ...game, featuredReason: 'overtime' });
        }
      });
      
      // Priority 2: Marquee matchups (LAL vs GSW, LAL vs BOS, etc.)
      const marqueeMatchups = [
        ['LAL', 'GSW'], ['GSW', 'LAL'],
        ['LAL', 'BOS'], ['BOS', 'LAL'],
        ['BOS', 'MIA'], ['MIA', 'BOS']
      ];
      mockGames.forEach(game => {
        const matchup = [game.awayTeam.abbreviation, game.homeTeam.abbreviation];
        const isMarquee = marqueeMatchups.some(m => 
          m[0] === matchup[0] && m[1] === matchup[1]
        );
        if (isMarquee && !featured.find(f => f.gameId === game.gameId)) {
          featured.push({ ...game, featuredReason: 'marquee' });
        }
      });
      
      // Priority 3: Best game (closest score)
      if (completedGames.length > 0) {
        const gamesWithScores = completedGames
          .map(game => ({
            game,
            scoreDiff: game.awayTeam.score !== null && game.homeTeam.score !== null
              ? Math.abs(game.awayTeam.score - game.homeTeam.score)
              : null
          }))
          .filter(item => item.scoreDiff !== null)
          .sort((a, b) => a.scoreDiff - b.scoreDiff);
        
        if (gamesWithScores.length > 0) {
          const bestGame = gamesWithScores[0].game;
          if (!featured.find(f => f.gameId === bestGame.gameId)) {
            featured.push({ ...bestGame, featuredReason: 'closest' });
          }
        }
      }
      
      // Priority 4: Live games
      liveGames.forEach(game => {
        if (!featured.find(f => f.gameId === game.gameId)) {
          featured.push({ ...game, featuredReason: 'live' });
        }
      });
      
      // All other games
      mockGames.forEach(game => {
        if (!featured.find(f => f.gameId === game.gameId)) {
          other.push(game);
        }
      });
      
      resolve({
        date: new Date().toISOString().split('T')[0],
        totalGames: mockGames.length,
        games: mockGames,
        // For testing, include all featured games (up to 3 for display, but all available)
        featured: featured.slice(0, 3),
        // Include all remaining games for complete testing
        other: other
      });
    }, 300); // Simulate 300ms API delay
  });
}

/**
 * Get mock home page data
 * @returns {Promise<Object>} Mock home page data
 */
export function getMockHomeData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        todayTopPerformers: {
          points: [
            {
              id: 'mock-player-1',
              name: 'LeBron James',
              team: 'Los Angeles Lakers',
              teamAbbreviation: 'LAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/1966.png',
              points: 45
            },
            {
              id: 'mock-player-2',
              name: 'Stephen Curry',
              team: 'Golden State Warriors',
              teamAbbreviation: 'GSW',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3975.png',
              points: 42
            },
            {
              id: 'mock-player-3',
              name: 'Kevin Durant',
              team: 'Phoenix Suns',
              teamAbbreviation: 'PHX',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3202.png',
              points: 38
            }
          ],
          rebounds: [
            {
              id: 'mock-player-4',
              name: 'Anthony Davis',
              team: 'Los Angeles Lakers',
              teamAbbreviation: 'LAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/6583.png',
              rebounds: 18
            },
            {
              id: 'mock-player-5',
              name: 'Rudy Gobert',
              team: 'Minnesota Timberwolves',
              teamAbbreviation: 'MIN',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3032977.png',
              rebounds: 16
            },
            {
              id: 'mock-player-6',
              name: 'Nikola Jokic',
              team: 'Denver Nuggets',
              teamAbbreviation: 'DEN',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3112335.png',
              rebounds: 15
            }
          ],
          assists: [
            {
              id: 'mock-player-7',
              name: 'Chris Paul',
              team: 'Golden State Warriors',
              teamAbbreviation: 'GSW',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/2779.png',
              assists: 15
            },
            {
              id: 'mock-player-8',
              name: 'Trae Young',
              team: 'Atlanta Hawks',
              teamAbbreviation: 'ATL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4278075.png',
              assists: 14
            },
            {
              id: 'mock-player-9',
              name: 'Luka Doncic',
              team: 'Dallas Mavericks',
              teamAbbreviation: 'DAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4066648.png',
              assists: 13
            }
          ]
        },
        seasonLeaders: {
          points: [
            {
              id: 'mock-player-1',
              name: 'LeBron James',
              team: 'Los Angeles Lakers',
              teamAbbreviation: 'LAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/1966.png',
              value: '34.7',
              statType: 'avgPoints'
            },
            {
              id: 'mock-player-2',
              name: 'Stephen Curry',
              team: 'Golden State Warriors',
              teamAbbreviation: 'GSW',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3975.png',
              value: '32.5',
              statType: 'avgPoints'
            },
            {
              id: 'mock-player-3',
              name: 'Kevin Durant',
              team: 'Phoenix Suns',
              teamAbbreviation: 'PHX',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3202.png',
              value: '31.8',
              statType: 'avgPoints'
            }
          ],
          rebounds: [
            {
              id: 'mock-player-4',
              name: 'Anthony Davis',
              team: 'Los Angeles Lakers',
              teamAbbreviation: 'LAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/6583.png',
              value: '12.3',
              statType: 'avgRebounds'
            },
            {
              id: 'mock-player-5',
              name: 'Rudy Gobert',
              team: 'Minnesota Timberwolves',
              teamAbbreviation: 'MIN',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3032977.png',
              value: '11.8',
              statType: 'avgRebounds'
            },
            {
              id: 'mock-player-6',
              name: 'Nikola Jokic',
              team: 'Denver Nuggets',
              teamAbbreviation: 'DEN',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/3112335.png',
              value: '11.2',
              statType: 'avgRebounds'
            }
          ],
          assists: [
            {
              id: 'mock-player-7',
              name: 'Chris Paul',
              team: 'Golden State Warriors',
              teamAbbreviation: 'GSW',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/2779.png',
              value: '10.5',
              statType: 'avgAssists'
            },
            {
              id: 'mock-player-8',
              name: 'Trae Young',
              team: 'Atlanta Hawks',
              teamAbbreviation: 'ATL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4278075.png',
              value: '9.8',
              statType: 'avgAssists'
            },
            {
              id: 'mock-player-9',
              name: 'Luka Doncic',
              team: 'Dallas Mavericks',
              teamAbbreviation: 'DAL',
              headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4066648.png',
              value: '9.2',
              statType: 'avgAssists'
            }
          ]
        }
      });
    }, 300);
  });
}

export default {
  getMockGames,
  getMockHomeData
};


