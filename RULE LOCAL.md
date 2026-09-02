# Règles d'exécution et de serveurs locaux (macOS)

- **Next.js :**
  - Ne JAMAIS exécuter `next dev` (ni Turbopack) en tâche de fond ou daemon dans les projets Next.js (consommation CPU/RAM excessive qui fait crasher/geler macOS).
  - Pour prévisualiser un projet Next.js localement, exécuter systématiquement un build de production suivi d'un start léger : `npm run build && npm run start`.
  - Si le mode développement avec hot-reloading est expressément nécessaire, donner la commande exacte à l'utilisateur pour qu'il la lance dans son propre terminal externe (`cd <dossier> && npm run dev`).

- **Astro :**
  - L'exécution de `npm run dev` ou `npx astro dev` est autorisée car le serveur de développement Astro est léger et consomme très peu de ressources.

- **Principe général d'économie de ressources :**
  - Toujours privilégier les commandes et serveurs légers (`serve`, `next start`, `astro dev`).
  - Ne jamais lancer de watcher ou compilateur lourd en tâche daemon persistante sans accord préalable.
