/**
 * Draw Engine Logic — 3-Tier Prize System
 *
 * Prize Distribution (per PRD Section 07):
 *   5-Number Match = 40% of pool (Jackpot — rolls over if no winner)
 *   4-Number Match = 35% of pool (no rollover)
 *   3-Number Match = 25% of pool (no rollover)
 */

// Generates the official 5-number winning draw (range 1-45)
export const generateDraw = (type = 'random', userScores = []) => {
  if (type === 'random' || userScores.length === 0) {
    const draw = new Set();
    while (draw.size < 5) {
      draw.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(draw).sort((a, b) => a - b);
  }

  // Algorithmic: Weight draw towards most-frequent submitted scores
  const scoreCounts = {};
  userScores.forEach(s => {
    scoreCounts[s] = (scoreCounts[s] || 0) + 1;
  });

  const draw = new Set();
  const sortedScores = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < Math.min(2, sortedScores.length); i++) {
    draw.add(parseInt(sortedScores[i][0]));
  }
  while (draw.size < 5) {
    draw.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(draw).sort((a, b) => a - b);
};

// Calculates tier prize amounts from the raw pool and optional jackpot rollover
export const calculatePrizePool = (activeSubscribers, subscriptionFee = 19.99, contributionPercent = 10, jackpotRollover = 0) => {
  const totalRevenue = activeSubscribers * subscriptionFee;
  const charityContribution = totalRevenue * (contributionPercent / 100);
  const currentPool = totalRevenue * 0.30;
  const prizePool = currentPool + jackpotRollover; // Jackpot carries forward!

  return {
    totalRevenue,
    charityTotal: charityContribution,
    prizePool,
    jackpotRollover,
    distributions: {
      match5: prizePool * 0.40, // Jackpot tier
      match4: prizePool * 0.35,
      match3: prizePool * 0.25,
    }
  };
};

// Evaluates how many of a user's scores appear in the winning draw
export const evaluateUserMatch = (userScores, winningDraw) => {
  const matchCount = userScores.filter(score => winningDraw.includes(score)).length;
  return matchCount;
};

/**
 * Core tier-draw function: distributes prizes based on match counts.
 * Returns { tier5winners, tier4winners, tier3winners, winningDraw, distributions, jackpotRolledOver }
 */
export const runTieredDraw = (usersWithScores, totalPool, jackpotRollover = 0, drawType = 'random') => {
  // 1. Generate the official winning 5 numbers based on configured logic
  const allScores = usersWithScores.flatMap(u => u.scores);
  const winningDraw = generateDraw(drawType, allScores);

  // 2. Evaluate each user's match count
  const matched = usersWithScores.map(u => ({
    user_id: u.user_id,
    matchCount: evaluateUserMatch(u.scores, winningDraw),
  }));

  // 3. Bucket winners into tiers (5-match, 4-match, 3-match)
  const tier5 = matched.filter(u => u.matchCount >= 5);
  const tier4 = matched.filter(u => u.matchCount === 4);
  const tier3 = matched.filter(u => u.matchCount === 3);

  // 4. Calculate tier pot sizes (rollover applied to total pool for jackpot)
  const effectivePool = totalPool + jackpotRollover;
  const match5Pot = effectivePool * 0.40;
  const match4Pot = effectivePool * 0.35;
  const match3Pot = effectivePool * 0.25;

  // 5. Split each pot evenly among winners in that tier
  const perWinner = (pot, count) => (count > 0 ? Math.floor((pot / count) * 100) / 100 : 0);

  const jackpotRolledOver = tier5.length === 0;

  return {
    winningDraw,
    tier5winners: tier5.map(u => ({ ...u, amount_won: perWinner(match5Pot, tier5.length), tier: 'match5' })),
    tier4winners: tier4.map(u => ({ ...u, amount_won: perWinner(match4Pot, tier4.length), tier: 'match4' })),
    tier3winners: tier3.map(u => ({ ...u, amount_won: perWinner(match3Pot, tier3.length), tier: 'match3' })),
    distributions: { match5: match5Pot, match4: match4Pot, match3: match3Pot },
    jackpotRolledOver,
    nextJackpotRollover: jackpotRolledOver ? match5Pot : 0,
    effectivePool,
    winningDrawFormatted: winningDraw.join(', ')
  };
};
