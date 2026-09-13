export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getPublicEntries = <T extends { data: { draft?: boolean; date: Date } }>(entries: T[]): T[] => {
  return entries
    .filter((entry) => import.meta.env.DEV || !entry.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
};