// === STORAGE POLYFILL ===
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    }
  };
}

// === DATE UTILITIES ===
export const getTodayKey = () => {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return new Date().toLocaleDateString('en-CA');
  }
};

export const getYesterdayKey = () => {
  try {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

export const getWeekDates = (weeksBack = 0) => {
  try {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 - (weeksBack * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  } catch (e) {
    console.error('Error getting week dates:', e);
    return [];
  }
};

export const getLast30Days = () => {
  try {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  } catch (e) {
    console.error('Error getting last 30 days:', e);
    return [];
  }
};

// === NUMBER PARSING ===
export const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// === FORMATTING ===
export const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch (e) {
    return dateStr;
  }
};

export const formatDateShort = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  } catch (e) {
    return dateStr;
  }
};
