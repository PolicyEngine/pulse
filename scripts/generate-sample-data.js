const fs = require('fs');
const path = require('path');

const teamMembers = ['Max', 'Nikhil', 'Pavel', 'Anthony', 'Vahid', 'Daphne', 'David', 'María', 'Ziming'];

// Generate 6 weeks of data
const weeks = [
  '2024-12-30',
  '2025-01-06', 
  '2025-01-13',
  '2025-01-20',
  '2025-01-27',
  '2025-02-03'
];

const responses = [];

weeks.forEach((weekEnding, weekIndex) => {
  teamMembers.forEach(member => {
    // Generate realistic variations in ratings
    const baseQuality = 5 + Math.sin(weekIndex * 0.5) * 2 + Math.random() * 2;
    
    const response = {
      name: member,
      weekEnding,
      blockedPercentage: Math.round(Math.max(1, Math.min(10, 3 + Math.random() * 4))),
      feelSupported: Math.round(Math.max(1, Math.min(10, baseQuality + Math.random() * 2))),
      workload: Math.round(Math.max(1, Math.min(10, 5 + (Math.random() - 0.5) * 4))),
      learnedNewSkills: Math.round(Math.max(1, Math.min(10, 4 + Math.random() * 4))),
      meetingProductivity: Math.round(Math.max(1, Math.min(10, baseQuality - 1 + Math.random() * 2))),
      soloProductivity: Math.round(Math.max(1, Math.min(10, baseQuality + Math.random() * 2))),
      weekQuality: Math.round(Math.max(1, Math.min(10, baseQuality))),
      feedback: weekIndex === weeks.length - 1 && Math.random() > 0.7 
        ? `Some feedback from ${member} about the recent week.`
        : '',
      timestamp: new Date(weekEnding).toISOString()
    };
    
    // Skip some responses randomly to simulate real data
    if (Math.random() > 0.1) {
      responses.push(response);
    }
  });
});

const data = { responses };

// Write to file
const filePath = path.join(__dirname, '..', 'data', 'surveys.json');
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`Generated ${responses.length} survey responses for ${weeks.length} weeks`);
console.log(`Data saved to ${filePath}`);