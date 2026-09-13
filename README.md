# Tech 46 Services

Site vitrine Astro de l'entreprise Tech 46 Services, spécialisée dans le dépannage informatique à domicile dans le nord du Lot (46) et les services numériques pour les professionnels.

## Développement local

```bash
npm install
npm run dev
```

Le site est ensuite disponible sur `http://localhost:4321`.

## Production

```bash
npm run build
npm run preview
```

Le contenu statique généré dans `dist/` est publié sur GitHub Pages par le workflow GitHub Actions.

## Ajouter un avis Google

Ajoutez l'avis authentique dans `src/data/reviews.ts`. La section reste invisible lorsque la liste est vide et apparaît automatiquement sur la page d'accueil dès qu'un avis est présent.

## Ajouter un conseil ou une actualité

1. Copiez `src/content/articles/exemple.md` sous un nom descriptif, par exemple `proteger-son-pc.md`.
2. Remplacez les métadonnées et le contenu.
3. Passez `draft` à `false` pour publier l'article.
4. Exécutez `npm run check` puis `npm run build`.

La page de conseils, les pages individuelles, leurs métadonnées SEO, leurs données structurées et le sitemap sont générés automatiquement.
