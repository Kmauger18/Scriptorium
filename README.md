# Scriptorium

L’atelier d’écriture de livres de Kéliann Mauger : romans SMS, journaux manuscrits, livres ensorcelés, anaglyphes, palimpsestes, dossiers d’enquête, labyrinthes à renvois, pliages, calligrammes et partitions — avec mise en page Amazon KDP, PDF, EPUB et vidéo MP4.

**Site :** https://kmauger18.github.io/Scriptorium/ · **Atelier :** https://kmauger18.github.io/Scriptorium/app/

## Structure

| Chemin | Contenu |
|---|---|
| `index.html` | Page d’accueil |
| `guide/` | Guide de l’atelier et syntaxe des scripts |
| `app/` | L’atelier (HTML, `css/scriptorium.css`, `js/scriptorium.js`, `js/fonts.js` pour les polices embarquées) |
| `docs/prompt-roman-sms.md` | Prompt pour faire écrire un script de roman SMS par une IA |
| `assets/` | Icône et styles du site |
| `manifest.webmanifest`, `sw.js` | Installation comme application et fonctionnement hors ligne |

Aucun serveur ni Firebase pour l’instant : les livres sont enregistrés dans le navigateur (IndexedDB). Exporter le livre en `.json` sert de sauvegarde.

## Mettre à jour

Après une modification, changez `VERSION` dans `sw.js` pour que les navigateurs récupèrent les nouveaux fichiers.
