## Rebrand to IEBC + Add QCM Evaluation & Project Upload

### 1. Rebrand: MTECHsolutions Academy → Centre de Formation IEBC/ IEBC E-Learning platform

**Brand identity**

- New name:  **IEBC E-Learning** (sitewide)
- Sub-brand for the e-learning platform: **IEBC centre de formations IEBC**
- Tagline (FR): *Plateforme de formation professionnelle offrant des cours certifiants en finance islamique, commerce international, management et technologies.*
- About copy mentions IEBC = *International Economics and Business Corporation*, a financial/economic firm specialized in deploying **Islamic finance in the CEMAC zone** and supporting digital transformation.
- Status badges on the homepage: **Disponible** (platform live) and **Planifié – 100% – deja Lancer**  (full e-learning rollout).

**Key selling points to surface on Hero / Index**

- Formations certifiantes en finance islamique
- Cours en ligne et présentiel 
- cours en visioconference
- Formateurs experts
- Accompagnement personnalisé
- Note (NB): formations en finance et produits de la **finance islamique**

**Files to edit**

- `index.html` — title, meta description, OG tags, JSON-LD Organization name → IEBC
- `src/components/Navbar.tsx` — brand label
- `src/components/Footer.tsx` — brand, copyright, description
- `src/components/Hero.tsx` — new headline, status badges, 4 USP bullets
- `src/pages/Index.tsx` — "IEBC Learning – Planifié 40%" section + Islamic finance note
- `src/pages/About.tsx` — full IEBC description (CEMAC, Islamic finance, digital transformation)
- `src/contexts/LanguageContext.tsx` — update brand strings in FR/EN translation maps

### 2. Add Islamic Finance courses but remove all pricing on pasted articles

Add to `src/data/courses.ts` (keeping existing ones):

- Introduction à la Finance Islamique
- **odule 14 semaines**
  ### **Fondements de la Charia**
  **Objectifs d'apprentissage :**
  - •Sources de la jurisprudence islamique
  - •Histoire de la jurisprudence
  - •Maqaasid Charia et règles jurisprudentielles majeures
  - •Jurisprudence des transactions
  - •Principales interdictions et sagesse de l'interdiction
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Fondements%20de%20la%20Charia%22%20du%20programme%20UIFTIC.)**
  **Module 24 semaines**
  ### **Produits Financiers Islamiques**
  **Objectifs d'apprentissage :**
  - •Financement participatif + étude de cas
  - •Financement basé sur la dette (commercial)
  - •Modes de financement non commerciaux
  - •Financement de services
  - •Opérations équivoques
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Produits%20Financiers%20Islamiques%22%20du%20programme%20UIFTIC.)**
  **Module 34 semaines**
  ### **Comptabilité & Normes AAOIFI**
  **Objectifs d'apprentissage :**
  - •Introduction aux normes AAOIFI
  - •Traitement comptable des produits islamiques
  - •Normes de reporting financier islamique
  - •Audit charia et conformité comptable
  - •Études de cas pratiques AAOIFI
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Comptabilit%C3%A9%20%26%20Normes%20AAOIFI%22%20du%20programme%20UIFTIC.)**
  **Module 44 semaines**
  ### **Gouvernance & Gestion Bancaire**
  **Objectifs d'apprentissage :**
  - •Organisation bancaire
  - •Gestion des comptes + étude de cas
  - •Comités charia et contrôle
  - •Gestion de la zakat + étude de cas
  - •Gestion des risques
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Gouvernance%20%26%20Gestion%20Bancaire%22%20du%20programme%20UIFTIC.)**
  **Module 53 semaines**
  ### **La Monnaie en Finance Islamique**
  **Objectifs d'apprentissage :**
  - •Nature et fonctions de la monnaie
  - •Monnaie et politique monétaire en finance islamique
  - •Paradigme monétaire en Islam
  - •Monnaie et inflation
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22La%20Monnaie%20en%20Finance%20Islamique%22%20du%20programme%20UIFTIC.)**
  **Module 63 semaines**
  ### **Crise Financière & Finance Islamique**
  **Objectifs d'apprentissage :**
  - •Introduction à la stabilité financière
  - •Crises du système financier conventionnel
  - •Échec des réponses classiques à l'instabilité systémique
  - •Approches alternatives du risque en FI
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Crise%20Financi%C3%A8re%20%26%20Finance%20Islamique%22%20du%20programme%20UIFTIC.)**
  **Module 73 semaines**
  ### **Takaful (Assurance Islamique)**
  **Objectifs d'apprentissage :**
  - •Principes de l'assurance classique
  - •Raisons de l'interdiction
  - •Fondements du Takaful (assurance solidaire)
  - •Modèles de gestion Takaful (wakala, mudaraba)
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Takaful%20(Assurance%20Islamique)%22%20du%20programme%20UIFTIC.)**
  **Module 83 semaines**
  ### **Sukuk & Marchés de Capitaux**
  **Objectifs d'apprentissage :**
  - •4 normes AAOIFI pour les marchés
  - •Gestion de portefeuille et fonds d'investissement
  - •14 contrats de sukuk nommés
  - •Gestion d'indices et screening
  - •Instruments de liquidité et couverture
  Frais :**250 000 FCFA**
  **Détails[WhatsApp](https://wa.me/237690895554?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20%22Sukuk%20%26%20March%C3%A9s%20de%20Capitaux%22%20du%20programme%20UIFTIC.)**
  **[S'inscrire au Programme](https://usfurcm.com/auth)**
- Produits de la Finance Islamique (Mourabaha, Ijara, Sukuk, Moudaraba)
- Commerce International en Zone CEMAC
- Management & Transformation Digitale

### 3. QCM Evaluation Module

qcm will be uploaded and trsncribed with its answrs so that students will be evaluated and scored immediately after the exam. like in alisons courses

**Database (Lovable Cloud migration)**

- `quizzes` — `id`, `course_id`, `title`, `passing_score` (int, default 70)
- `quiz_questions` — `id`, `quiz_id`, `question`, `options` (jsonb array), `correct_index` (int), `order`
- `quiz_attempts` — `id`, `user_id` (auth.uid), `quiz_id`, `score` (int), `answers` (jsonb), `passed` (bool), `created_at`
- RLS:
  - `quizzes` / `quiz_questions`: SELECT for authenticated; ALL for admins (via `has_role`)
  - `quiz_attempts`: users SELECT/INSERT their own rows; admins SELECT all
- Standard `GRANT` block on every public table.

**Frontend**

- `src/pages/QuizPage.tsx` — render questions, submit, show score
- Add "Évaluation QCM" tab on `CourseViewer.tsx`
- Admin view: list attempts with score + pass/fail

### 4. Student Project Upload

Learners upload a project file per course; admins review and grade.(pdf and docx only)(maximum size 20mb)

**Storage**

- Private Lovable Cloud Storage bucket `student-projects`
- Storage policies: user can INSERT/SELECT objects under `user_id/` prefix; admins can SELECT all

**Database**

- `project_submissions` — `id`, `user_id`, `course_id`, `file_path`, `file_name`, `notes`, `status` (`pending|approved|rejected`), `admin_feedback`, `grade` (int), `submitted_at`, `reviewed_at`
- RLS: users INSERT/SELECT own; admins SELECT/UPDATE all
- GRANT block included

**Frontend**

- `src/components/ProjectUpload.tsx` — file picker + notes, uploads to bucket and inserts row
- Admin tab in `src/pages/Admin.tsx`: list submissions with download link, feedback textarea, status/grade controls

### 5. Security maintenance

- Keep existing `user_roles` + `has_role()` SECURITY DEFINER pattern (no role columns on profiles).
- Every new table: explicit `GRANT` + `ENABLE ROW LEVEL SECURITY` + policies in the same migration.
- Storage bucket kept private; access only via signed URLs generated server-side / through RLS-checked client calls.
- No service-role keys in client code.
- Access-code gate stays in place gotten from either login or admin whatsapp response or as an otp from email sent from iebc learning platform)

### Technical summary

```text
Migration order per table:
  CREATE TABLE → GRANT (authenticated + service_role) → ENABLE RLS → CREATE POLICY
```

```text
Routes added:
  /courses/:id/quiz       (learner)
  /courses/:id/submit     (learner)
  /admin  -> new tabs: Quiz Attempts, Project Submissions
```

### Out of scope (ask if you want them)

- Auto-grading of uploaded projects (admins grade manually for now)
- Certificate PDF generation tied to QCM pass(average score for certificate should be 85/100) + project approval by admin
- Email notifications on submission/review