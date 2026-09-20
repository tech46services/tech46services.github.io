type TarifItem = {
  name: string;
  detail?: string;
  price: string;
};

type TarifCategory = {
  id: string;
  category: string;
  items: TarifItem[];
};

export const tarifs: TarifCategory[] = [
  {
    id: "depannage-entretien",
    category: "Dépannage & entretien",
    items: [
      { name: "Diagnostic / recherche de panne", detail: "Jusqu'à 30 minutes", price: "35 €" },
      { name: "Dépannage informatique", price: "65 € / heure" },
      { name: "Optimisation système", price: "55 €" },
      { name: "Suppression de virus / malwares", price: "65 €" },
    ],
  },
  {
    id: "systeme-donnees",
    category: "Système & données",
    items: [
      { name: "Réinstallation complète Windows / Linux", price: "90 €" },
      { name: "Réinstallation + sauvegarde / restauration des données", detail: "Jusqu'à 50 Go", price: "110 €" },
      { name: "Récupération de données", price: "à partir de 60 €" },
    ],
  },
  {
    id: "assistance-entretien",
    category: "Assistance & entretien physique",
    items: [
      { name: "Assistance informatique à distance", detail: "30 minutes", price: "35 €" },
      { name: "Nettoyage physique du PC", price: "55 €" },
    ],
  },
];
