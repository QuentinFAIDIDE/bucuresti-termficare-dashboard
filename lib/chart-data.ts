export const generateMockChartData = (days = 30) => {
  const data = [];
  const startDate = new Date("2024-01-01");

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    data.push({
      time: date.getTime(),
      working: Math.floor(40 + Math.random() * 10),
      issues: Math.floor(5 + Math.random() * 8),
      broken: Math.floor(2 + Math.random() * 3),
    });
  }

  return data;
};