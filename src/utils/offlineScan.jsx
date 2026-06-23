const STORAGE_KEY = "offline_scans";

export const saveOfflineScan = (ticketNo) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  if (!existing.find(t => t.ticketNo === ticketNo)) {
    existing.push({
      ticketNo,
      scannedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getOfflineScans = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const clearOfflineScans = () => {
  localStorage.removeItem(STORAGE_KEY);
};
