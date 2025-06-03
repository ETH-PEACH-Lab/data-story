
export const generateRandomName = () => {
  const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Skyler'];
  return names[Math.floor(Math.random() * names.length)];
};