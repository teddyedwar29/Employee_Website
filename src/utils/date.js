export const isToday = (tanggal) => {
  if (!tanggal) return false;

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (LOCAL TIME)
  return tanggal === today;
};
