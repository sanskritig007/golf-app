/**
 * Draw Engine Logic
 */

// Simulates generating a winning draw (5 numbers between 1 and 45)
export const generateDraw = (type = 'random', userScores = []) => {
  if (type === 'random' || userScores.length === 0) {
    const draw = new Set();
    while (draw.size < 5) {
      draw.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(draw).sort((a, b) => a - b);
  }

  const scoreCounts = {};
  userScores.forEach(s => {
    scoreCounts[s] = (scoreCounts[s] || 0) + 1;
  });
  
  const draw = new Set();
  // Try to pick up to 2 weighted numbers
  const sortedScores = Object.entries(scoreCounts).sort((a,b) => b[1] - a[1]);
  for (let i = 0; i < Math.min(2, sortedScores.length); i++) {
    draw.add(parseInt(sortedScores[i][0]));
  }
  
  // Fill the rest randomly
  while (draw.size < 5) {
    draw.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(draw).sort((a, b) => a - b);
};

// Calculates the prize pool distribution given active subscribers
export const calculatePrizePool = (activeSubscribers, subscriptionFee = 19.99, contributionPercent = 10) => {
  const totalRevenue = activeSubscribers * subscriptionFee;
  const charityContribution = totalRevenue * (contributionPercent / 100);
  const prizePool = totalRevenue * 0.30; 

  return {
    totalRevenue,
    charityTotal: charityContribution,
    prizePool: prizePool,
    distributions: {
      match5: prizePool * 0.40, 
      match4: prizePool * 0.35,
      match3: prizePool * 0.25, 
    }
  };
};

// Evaluates a user's 5 scores against the winning draw
export const evaluateUserMatch = (userScores, winningDraw) => {
  const matchCount = userScores.filter(score => winningDraw.includes(score)).length;
  return matchCount;
};
