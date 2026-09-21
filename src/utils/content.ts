export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getPublicEntries = <T extends { data: { draft?: boolean; date?: Date } }>(entries: T[], sortByDate = true): T[] => {
  const publicEntries = entries.filter((entry) => import.meta.env.DEV || !entry.data.draft);

  if (!sortByDate) return publicEntries;

  return publicEntries.sort((a, b) => {
      if (a.data.date && b.data.date) return b.data.date.valueOf() - a.data.date.valueOf();
      if (a.data.date) return -1;
      if (b.data.date) return 1;
      return 0;
  });
};
