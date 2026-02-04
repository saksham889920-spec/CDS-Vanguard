
const DAILY_QUOTA = 500;
const STORAGE_KEY = 'vanguard_intel_energy';
const DATE_KEY = 'vanguard_last_refresh';

export const getEnergyData = () => {
  const now = new Date();
  const today = now.toDateString();
  const lastRefresh = localStorage.getItem(DATE_KEY);

  // If it's a new day, reset energy
  if (lastRefresh !== today) {
    localStorage.setItem(STORAGE_KEY, DAILY_QUOTA.toString());
    localStorage.setItem(DATE_KEY, today);
    return { energy: DAILY_QUOTA, quota: DAILY_QUOTA };
  }

  const storedEnergy = localStorage.getItem(STORAGE_KEY);
  const currentEnergy = storedEnergy ? parseInt(storedEnergy, 10) : DAILY_QUOTA;
  
  return { energy: currentEnergy, quota: DAILY_QUOTA };
};

export const consumeEnergy = (amount: number = 1): number => {
  const { energy } = getEnergyData();
  const newEnergy = Math.max(0, energy - amount);
  localStorage.setItem(STORAGE_KEY, newEnergy.toString());
  return newEnergy;
};

export const getRemainingEnergy = (): number => {
  return getEnergyData().energy;
};
