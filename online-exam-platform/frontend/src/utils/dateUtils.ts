export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString();
};

export const isDateInPast = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const isDateInFuture = (date: string): boolean => {
  return new Date(date) > new Date();
};

export const getRemainingTime = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};