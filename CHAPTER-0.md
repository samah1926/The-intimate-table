# THE HOUSE — Chapter 0

## Routes

- Invitation publique, sans compte : `/chapter-0`.
- Réponses privées : `/admin/chapter-0-responses` ; une session Supabase avec un profil `role = host` est obligatoire. Le mode démo n’autorise pas cette vue.

## Direction artistique réutilisée

`src/app/globals.css` : Cormorant Garamond et Instrument Sans, ivoire #f5f0e8, papier #eee7dc, encre #1d1814, bordeaux #5b1d24. Classes existantes `wordmark`, `display`, `lede`, `eyebrow`, `meta`, `hairline`, `btn-primary`, `btn-quiet`, `grain`. Composant `Picture`, photos `house-arch.webp` et `table-sunset.webp`. Gabarit existant : largeur 84rem, marges 24/40/56px, sections 80/112px, espacements de grille 48/96px.

## Mise en ligne sur le projet Vercel existant

1. Intégrer cette branche dans la branche de production utilisée par Vercel (Settings → Git → Production Branch). Le dépôt cloné utilise `claude/intelligent-curie-zz5y4f` ; vérifier la branche de production dans Vercel.
2. Si Supabase est utilisé : exécuter `supabase/migrations/0002_chapter_zero_responses.sql` dans le SQL Editor du projet existant (après la migration 0001). Les trois variables Supabase existantes restent nécessaires. La clé service role reste exclusivement côté serveur.
3. Dans Vercel → Settings → Environment Variables, laisser `CHAPTER_ZERO_START_DATE` vide tant que les dates ne sont pas fixées. Ensuite renseigner le vendredi de départ au format ISO avec fuseau, par exemple `2027-03-12T16:00:00+00:00` (exemple technique, pas une date d’événement retenue), puis redéployer. Le compte à rebours utilise le jour local de Marrakech.
4. Après réussite du déploiement, partager `https://the-intimate-table.vercel.app/chapter-0`. Cette URL est la destination prévue ; elle n’est active qu’après déploiement.
5. Se connecter avec le compte hôte et ouvrir `/admin/chapter-0-responses` pour consulter les réponses et cocher « A payé », puis enregistrer.

Sans configuration Supabase, le questionnaire ne promet pas de sauvegarde serveur : « Copier mes réponses » et WhatsApp restent disponibles. WhatsApp ouvre le sélecteur de destinataire ; aucun numéro n’est codé en dur. Le brouillon est conservé dans le navigateur sur l’appareil d’origine. Avec Supabase, le jeton aléatoire du navigateur permet de mettre à jour sa propre réponse sans dupliquer la ligne ni modifier le statut du paiement. Une erreur de base conserve le brouillon et permet la copie ou WhatsApp.

La page est exclue de l’indexation par les moteurs ; toute personne ayant son lien peut la consulter. Les réponses ne sont jamais incluses dans la page publique. Les contrôles de rôle sont réappliqués dans l’action de paiement.
