# Plan — Refonte IEBC E-Learning

Le périmètre demandé est vaste (~20 chantiers). Pour livrer proprement sans casser l'existant, je propose de découper en **6 lots** livrés séquentiellement. Confirme le lot par lequel commencer (ou "tout dans l'ordre").

## Lot 1 — Config & contacts (rapide)
- Frais d'inscription : **65 000 XAF** (~99 €), affiché avec devise + équivalent EUR sur `/register` et cartes cursus
- Support **WhatsApp +221 70 658 48 59** partout (remplace 693122020) avec messages pré-remplis
- Bouton WhatsApp flottant permanent sur toutes les pages (composant global dans `App.tsx`)
- Page `/register` refondue : prix, devise, procédure d'inscription pas-à-pas, contact support

## Lot 2 — Super Admin Dashboard
- Nouvelle route `/admin` réorganisée avec onglets consolidés :
  - **Vue d'ensemble** (KPIs) : nb étudiants, inscriptions, taux réussite, revenus estimés, progression moyenne, activité récente
  - **Utilisateurs** : liste + filtres par rôle (étudiant/enseignant/admin), promotion/rétrogradation, suspension
  - **Pédagogie** : Pôles / Cursus / Modules / Leçons (existe déjà, à polir)
  - **Évaluations** : Quiz, Examens, Banque de questions, Projets
  - **Certificats** : modèles + signataires (nouveau)
  - **Paiements** : historique validations WhatsApp
  - **Rapports** : export CSV/PDF
  - **Audit** (existe)

## Lot 3 — Pôles & Cursus enrichis
- Champ `responsable` (nom + photo) sur `poles`
- Sur `cursus` : `competences` (array), `conditions_admission` (text), objectifs déjà présents
- UI admin + affichage public enrichi (page détail cursus)

## Lot 4 — Quiz par module + Banque de questions étendue
- Table `quiz_questions` : ajouter `difficulty`, `theme`, `question_type` (qcm/vrai-faux/reponse-courte)
- Génération auto d'un quiz vide à la création d'un module
- Expérience QCM : **auto-avance** sur validation (Entrée / bouton Suivant)
- **Randomisation A/B/C/D** à chaque tentative (shuffle côté serveur dans `exam-start`)
- Export résultats : CSV, JSON, PDF, DOCX
- **Restriction examen final** : blocage tant que progression < 100% + quiz non validés, message explicatif

## Lot 5 — Projet fin de formation + Certificats avancés
- Note finale = **40% projet + 60% QCM** (calcul dans `exam-submit` + trigger certificat)
- UI étudiant : téléverser projet, voir statut/note/commentaires (table `project_submissions` existe)
- UI admin correcteur : noter + commenter
- **Modèles de certificats** (nouvelle table `certificate_templates`) :
  - Plusieurs modèles, signataires configurables, activation/désactivation
  - Prévisualisation avant publication
  - QR code de vérification (existe), numéro unique (existe)
  - Génération PDF automatique après validation (40/60)

## Lot 6 — Performance, sécurité, chatbot, responsive
- **Perf** : lazy-loading routes (`React.lazy`), compression images (`vite-imagetools`), preload LCP, cache React Query aggressif, index DB sur colonnes chaudes
- **Responsive** : audit mobile/tablette sur toutes les pages clés
- **Chatbot IEBC** : mise à jour du system prompt (formations IEBC, procédures, tarif 65k, WhatsApp +221)
- **Sécurité** : vérification RLS, audit log étendu (déjà en place), rate-limit edge functions
- **Ressources pédagogiques** : section "Bibliographie" + "Liens utiles" sur module (déjà partiellement via `module_resources`)

## Détails techniques
- Migrations SQL groupées par lot (avec GRANTs sur toute nouvelle table)
- Edge functions modifiées : `exam-start` (shuffle options), `exam-submit` (score 40/60), `ai-chat` (nouveau prompt IEBC)
- Nouveaux composants : `FloatingWhatsApp`, `AdminUsers`, `AdminCertificateTemplates`, `AdminReports`, `ProjectSubmission`
- Pas de changement de stack — reste React/Vite/Tailwind/Supabase

## Question
Par quel lot veux-tu commencer ? Je recommande l'ordre **1 → 2 → 4 → 5 → 3 → 6** (impact utilisateur décroissant). Réponds "go" pour enchaîner dans cet ordre, ou nomme un lot précis.
