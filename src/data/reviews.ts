export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text?: string;
  date: string;
  sourceUrl: string;
}

// Ajoutez ici uniquement des avis Google authentiques et reproduits fidèlement.
export const reviews: Review[] = [
  {
    author: "Léa D.",
    rating: 5,
    text: "Service au top ! Il est réactif aux appels/messages, a pris le temps de m'expliquer et trouver le meilleur compromis en tenant compte de tous les paramètres. Réparation rapide. Je retrouve enfin un ordinateur portable fonctionnel et peux travailler dans de bonnes conditions. Merci infiniment :)",
    date: "2026-09-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
  {
    author: "Marie-Christine B.",
    rating: 5,
    text: "Merci pour un service parfait, à votre écoute et très disponible",
    date: "2026-07-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
  {
    author: "Tifaine R.",
    rating: 5,
    text: "Très sympathique, réactif et compétent ! Je recommande 100%",
    date: "2026-06-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
  {
    author: "Emilie K.",
    rating: 5,
    text: "Super sympa, efficace, nickel 😁👍🏻",
    date: "2026-06-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
  {
    author: "Pascal S.",
    rating: 5,
    text: "Réactif, aimable et compétent. Panne réglée très rapidement. J'espère ne pas avoir à le faire mais si besoin je ferai de nouveau appel à ses services sans hésiter.",
    date: "2026-03-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
  {
    author: "Carole L.",
    rating: 5,
    text: "contact chaleureux, intervention très rapide, très compétent. Excellent rapport qualité prix. Bravo. A recommander ++++++",
    date: "2026-01-01",
    sourceUrl: "https://share.google/bXzFi34loEhX2cXFx",
  },
];
