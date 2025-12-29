export const isToday = (tanggal) => {
  if (!tanggal) return false;

  const today = new Date().toISOString().slice(0, 10);
  return tanggal === today;
};
