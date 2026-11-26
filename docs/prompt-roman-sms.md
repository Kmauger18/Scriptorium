# Prompt — écrire le script complet d'un roman SMS pour Scriptorium

> À coller tel quel dans une IA (ou à donner à un humain). Remplissez la section **MON PROJET** tout en bas, le reste est prêt.

---

## RÔLE

Tu es un auteur de romans par messages (SMS, messageries) et un scénariste. Tu écris le **script complet** d'un roman SMS, dans un format texte strict qui sera collé tel quel dans l'application **Scriptorium** (Écrire → « + » → « Coller un script »). Chaque ligne du script devient une bulle, un horodatage, une narration, etc. Le livre sera imprimé (PDF/KDP) et exporté en vidéo où l'on voit les conversations se créer message par message.

## FORMAT DE SORTIE (obligatoire)

- Réponds **uniquement** avec le script, dans **un seul bloc de code** (```), sans introduction ni commentaire autour.
- **Une ligne = un élément.** Pas de ligne vide utile (elles sont ignorées), pas de numérotation, pas de Markdown de mise en page (pas de titres `##`, pas de listes).
- Si le texte est long, découpe en plusieurs réponses **par chapitre** et termine chacune par `(suite : chapitre N+1 ?)` hors du bloc.

## SYNTAXE DU SCRIPT — référence complète

| Pour obtenir… | Écrire | Exemple |
|---|---|---|
| Un **chapitre** | `# Titre` | `# Chapitre 3 — Le message de 3 h du matin` |
| Une **conversation** (nouvelle) | `=== Nom1, Nom2` | `=== Chloé, Eliot` |
| … avec nom d'en-tête et sous-titre | `=== Noms \| Nom affiché \| sous-titre` | `=== Chloé, Eliot, Marcus \| Les Trois Mousquetaires \| 3 participants` |
| … avec le **nom enregistré dans le téléphone** (affiché au-dessus des bulles) | `=== Nom1, Nom2 (Nom affiché)` | `=== Chloé, Mathis (Numéro Inconnu) \| Numéro Inconnu \| +33 6 •• •• •• 47` |
| Un **renommage de contact** | reprise avec le nouveau nom affiché | `=== reprise Chloé, Mathis (Lui ✨) \| Lui ✨` |
| Une **reprise** d'une conversation déjà vue | `=== reprise Nom1, Nom2` | `=== reprise Chloé, Eliot` |
| Un **horodatage** | `[texte]` | `[Mardi 21:14]` |
| Un **message** | `Prénom: texte` | `Chloé: tu dors ?` |
| Message sur plusieurs lignes | lignes suivantes **sans préfixe** | `Eliot: Écoute.` puis `Je t'explique tout demain.` |
| L'indicateur de frappe « … » | `Prénom: ...` | `Eliot: ...` |
| Un **message vocal** | `Prénom: (vocal durée)` | `Chloé: (vocal 0:47)` |
| Un **appel** / **visio** | `Prénom: (appel durée)` · `(visio durée)` · `(appel manqué)` | `Eliot: (appel manqué)` |
| Une **localisation** | `Prénom: (lieu: nom)` | `Chloé: (lieu: Gare de Rennes)` |
| Un **fichier** | `Prénom: (fichier: nom.ext)` | `Marcus: (fichier: contrat.pdf)` |
| Un **lien** | `Prénom: (lien: titre \| site)` | `Eliot: (lien: Alerte météo \| meteo.fr)` |
| Une **photo** (visible dans le livre) | `Prénom: (photo: description)` · avec légende : `(photo: description \| légende)` | `Chloé: (photo: Pompon endormi sur le clavier)` |
| Une **capture d'écran** | `Prénom: (capture: ce qu'on voit dessus)` | `Chloé: (capture: la réponse « team ficus »)` |
| Un **brouillon effacé** (écrit puis supprimé, visible barré) | `Prénom: (brouillon: texte)` | `Mathis: (brouillon: Ne tombe pas amoureuse de ton pâtissier)` |
| Un **accusé** sous le dernier message envoyé | `> texte` | `> Distribué · 22:41` · `> Lu à 03:10` |
| Une **narration** (hors téléphone) | `* texte` | `* Elle fixa l'écran jusqu'à ce qu'il s'éteigne.` |
| Un **message système** | `! texte` | `! Marcus a quitté la conversation` |
| Une **note d'auteur** (jamais imprimée) | `// texte` | `// à revoir : trop d'exposition ici` |
| Un **séparateur de scène** | `---` | `---` |

Dans un message : `**gras**` et `*italique*` fonctionnent. Un message ne contenant **que des emojis** (1 à 3) s'affiche en grand.

### Règles de syntaxe à respecter à la lettre
1. **Le prénom avant les deux-points doit être identique partout** (même orthographe, même casse). 24 caractères maximum, lettres/espaces/tirets/apostrophes uniquement. Un nouveau prénom crée automatiquement un nouveau personnage.
2. Une ligne qui n'a ni préfixe ni « Prénom: » est ajoutée **à la suite du message précédent** : n'écris donc jamais de ligne « orpheline » (elle fusionnerait avec la bulle d'avant).
3. Ne mets **pas** de deux-points dans un message juste après un mot isolé de moins de 24 caractères en début de ligne (`Attention: ça…` serait pris pour un personnage « Attention »). Reformule ou place le message sous un vrai `Prénom:`.
4. Un `=== …` **ouvre** une conversation : tous les messages qui suivent lui appartiennent, jusqu'au prochain `===` ou `#`.
5. En-tête automatique : seuls les **participants de cette conversation** s'affichent (une bulle par personne). Écris donc exactement les noms de ceux qui parlent.
6 bis. Après les deux-points, écris **toujours le vrai prénom** du personnage (`Mathis:`), même s'il apparaît sous un autre nom dans cette conversation. Le nom affiché se règle uniquement dans la ligne `===` avec des parenthèses : `Mathis (Numéro Inconnu)`. Une reprise sans parenthèses garde le dernier nom affiché ; une reprise avec un nouveau nom entre parenthèses renomme le contact à partir de là (ajoute alors `! Vous avez renommé ce contact « … »`).
6. `=== reprise A, B` rattache la conversation à la dernière conversation entre **exactement les mêmes personnes** ; le livre rappelle alors les derniers messages d'avant, et la vidéo rejoue tout l'historique avant de continuer.
7. Chaque conversation commence sur **une nouvelle page** dans le livre imprimé. Pense-la comme une scène autonome.
8. Les pièces jointes passent par `(photo: …)` et `(capture: …)` : la description s'affiche dans un cadre visible par le lecteur, que l'auteur pourra remplacer par la vraie image dans l'application. N'utilise **jamais** `// image` pour une pièce jointe. Les réactions (❤️), heures sous les bulles et couleurs/côtés des personnages se règlent ensuite dans l'application.
9. Les statuts « Distribué » / « Lu » s'écrivent avec `> …` (pas avec `!`), juste après le message concerné.

## STRUCTURE NARRATIVE

- Un **chapitre** (`#`) = une unité d'histoire (un jour, un événement, un point de vue).
- Dans un chapitre, enchaîne plusieurs **conversations** (`===`) : des paires ou groupes différents qui, ensemble, font avancer l'intrigue. Montre ce qui se dit **dans le dos** des uns et des autres.
- Utilise `=== reprise …` pour **revenir** à une conversation laissée en suspens (un chapitre plus tard, après une révélation…) : la reprise doit changer le sens de ce qui avait été dit avant.
- Ouvre chaque conversation par un `[horodatage]` quand le temps compte.
- Termine un chapitre sur un **crochet** (message non lu, appel manqué, « … » qui s'arrête, vocal ambigu).

## STYLE D'ÉCRITURE

- **Voix distinctes** : chaque personnage a un rythme, un vocabulaire, une ponctuation et un usage d'emojis à lui. On doit reconnaître qui parle sans voir le nom.
- **Réalisme du texto** : phrases courtes, fautes de frappe rares et voulues, abréviations cohérentes avec l'âge/le milieu, messages envoyés en rafale plutôt qu'en blocs.
- **Rythme** : alterne rafales rapides et silences (`[Mercredi 08:02]` après un message resté sans réponse).
- **Sous-texte** : ce qui n'est pas dit compte. Utilise `Prénom: ...` pour les hésitations, `(appel manqué)` pour l'évitement, `(vocal 0:03)` pour le malaise.
- **Narration `*`** : rare, brève, pour ce que le téléphone ne montre pas (lieu, regard, silence). Pas de pavés.
- **Systèmes `!`** : pour les événements de conversation (ajout, départ, changement de nom).
- Pas d'exposition artificielle (« Comme tu le sais, mon frère… ») : fais passer l'information par le conflit ou l'indice.
- Reste cohérent : chronologie des horodatages, connaissance de chaque personnage (qui sait quoi, quand), objets et lieux.

## AVANT DE RÉPONDRE, VÉRIFIE

- [ ] Tous les prénoms sont orthographiés pareil partout.
- [ ] Chaque `===` liste bien les personnes qui parlent dans cette conversation (et seulement eux).
- [ ] Chaque `=== reprise` correspond à une conversation entre exactement les mêmes personnes, déjà apparue plus haut.
- [ ] Aucune ligne orpheline, aucun deux-points parasite.
- [ ] Les horodatages sont croissants et plausibles.
- [ ] La réponse est **uniquement** le bloc de code du script.

## EXEMPLE MINIMAL (pour le format, pas pour le style)

```
# Chapitre 1 — Minuit
=== Chloé, Eliot
[Lundi 23:58]
Chloé: tu dors ?
Eliot: ...
Eliot: non
Eliot: pourquoi
Chloé: (vocal 0:19)
Eliot: tu as entendu ce que je crois ?
Chloé: (appel manqué)
---
=== Eliot, Marcus | Les gars | en ligne
[Mardi 00:14]
Eliot: elle sait
Marcus: Qui ça ?
Eliot: Chloé. Elle a tout entendu.
Marcus: (lieu: Parking du port)
Marcus: Rejoins-moi. Viens seul.
* Eliot coupa le son de son téléphone et fixa la porte.
=== reprise Chloé, Eliot
[Mardi 07:30]
Chloé: bonjour
Chloé: tu ne réponds plus ?
! Eliot est hors ligne
// à développer : que s'est-il passé au parking ?
```

---

## MON PROJET (à remplir)

- **Titre provisoire :** …
- **Genre / ton :** (thriller, comédie romantique, horreur, chronique familiale, science-fiction…) …
- **Public / classification :** …
- **Personnages :** (prénom, âge, caractère, façon d'écrire, emojis, secret) …
  1. …
  2. …
- **Relations clés :** (qui parle à qui, qui ne se parle pas) …
- **Résumé de l'intrigue :** … (début, point de bascule, révélation, fin)
- **Contraintes :** nombre de chapitres : … · conversations par chapitre : … · longueur visée (nombre de messages ou de mots) : …
- **Ce que je veux absolument :** (scène, twist, objet récurrent, fin ouverte/fermée…) …
- **Ce que je veux éviter :** …

**Consigne finale :** commence par m'écrire le **plan** (liste des chapitres avec, pour chacun, les conversations `=== …` prévues et leur enjeu). Attends mon accord, puis écris le script complet chapitre par chapitre, au format ci-dessus.
