# Plan : chevauchement bas de certificat + éditeur WYSIWYG drag-and-drop

## 1. Corriger le chevauchement en bas

Sur les captures actuelles, la zone basse mélange trois éléments qui se marchent dessus : le bloc gauche (« Délivré le… / Réf. / Vérification : https://… ») déborde vers le sceau central, la signature se pose sur ce sceau, et le QR + « Scannez pour vérifier » remontent trop haut à droite. Correctif dans `src/lib/certificate.ts` :

- **Réserver une bande basse propre** : dessiner un bandeau blanc semi-transparent (opacité ~0.9) sur toute la largeur, hauteur ~120pt, quand un fond image est présent. La signature, la référence et le QR s'inscrivent uniquement dans cette bande.
- **Trois colonnes fixes** au lieu d'empilements libres :
  - Gauche : `Délivré le…` + `Réf.` seulement. Le lien de vérification long est retiré (le QR le porte déjà).
  - Centre : signature (titre en italique, ligne, nom en gras) — remonte de quelques points pour ne pas croiser le sceau.
  - Droite : QR + libellé « Scannez pour vérifier », resserré (QR ~90pt).
- **`maxWidth` sur chaque `doc.text`** de la bande basse pour empêcher le débordement horizontal, et suppression totale du long URL au profit d'un « Vérifier : iebccm.online » discret sous la référence.

Ces règles s'appliquent aux certificats plateforme et conjoints (même moteur `generateCertificatePdf`).

## 2. Éditeur WYSIWYG drag-and-drop de la mise en page

Aujourd'hui la position de chaque champ est codée en dur dans `certificate.ts`. On introduit un **layout** stocké par modèle : un JSON qui liste des blocs (titre, nom lauréat, cursus, note, signataire, référence, date, footer, QR) avec `{ x, y, width, align, fontSize, weight, italic, color }` en pourcentage de la page A4 paysage. L'admin (et le pédagogue via `AdminPartnerCertificates`) déplace chaque bloc à la souris sur un aperçu HTML, le layout est enregistré, et le PDF utilise ces coordonnées.

### Composant `CertificateLayoutEditor.tsx`

- Rendu HTML fidèle du certificat : image de fond en cover, blocs positionnés en `absolute` via `%` de largeur/hauteur, ratio A4 paysage (1.4142).
- Chaque bloc est déplaçable (drag) et redimensionnable en largeur (poignée droite), avec snapping léger sur une grille 1 %.
- Panneau de propriétés à droite pour le bloc sélectionné : taille de police, gras/italique, alignement (gauche/centre/droite), couleur (avec présence de « couleur du modèle » par défaut), verrouillage, masquage.
- Boutons haut : Réinitialiser au layout par défaut, Annuler/Refaire (historique local), Enregistrer.
- Utilise `useState` + `useRef` + `MouseEvent`, pas de dépendance externe drag-and-drop (léger).

### Persistance

- Nouvelle colonne `layout jsonb` sur `certificate_templates` **et** `partner_programs`. Si `null`, on retombe sur le layout par défaut actuel.
- Le layout par défaut est extrait en constante partagée dans `src/lib/certificate.ts` (`DEFAULT_CERTIFICATE_LAYOUT`) et utilisé à la fois par le PDF et par l'éditeur.

### Génération PDF

- `generateCertificatePdf` accepte `template.layout`. Pour chaque bloc, calcule `x, y, w` en points depuis les pourcentages et rend le texte avec `align` et `maxWidth`. Le QR utilise sa propre entrée `qr` (position + taille).
- Deux modes : **libre** (utilise les coordonnées personnalisées) et **automatique** (chemin existant si `layout` est absent). Cela garantit qu'aucune session pédagogue n'est cassée si elle n'a pas encore touché à l'éditeur.

### Intégration

- Dans `AdminCertificateTemplates` (plateforme) : un nouvel onglet « Mise en page » dans le dialogue d'édition qui monte `CertificateLayoutEditor` sur l'aperçu.
- Dans `AdminPartnerCertificates` (conjoint) : idem, un nouvel onglet dans le dialogue programme.
- Le rôle `pedagogue` a déjà accès à ces écrans (à vérifier dans les policies existantes ; sinon on ajoute une règle de lecture/écriture au layout des modèles publiés).

## Détails techniques

```ts
// src/lib/certificate.ts (extrait)
export type LayoutBlock = {
  key: "title" | "intro" | "name" | "body" | "cursus" | "score" | "footer_note"
     | "signature_title" | "signature_name" | "issued" | "code" | "verify_url";
  x: number; y: number; w: number;              // en % de la page
  align: "left" | "center" | "right";
  fontSize: number; bold?: boolean; italic?: boolean;
  color?: string | "primary";
  hidden?: boolean;
};
export type CertificateLayout = {
  blocks: LayoutBlock[];
  qr: { x: number; y: number; size: number; hidden?: boolean };
};
export const DEFAULT_CERTIFICATE_LAYOUT: CertificateLayout = { /* copié des valeurs actuelles */ };
```

```text
Page (100% x 100%, ratio 1.414)
+-----------------------------------------------------+
| [title]                                             |
| [intro]                                             |
| [name]                                              |
| [body]                                              |
| [cursus]                                            |
| [score]                                             |
| [footer_note]                                       |
|                                                     |
| [issued]                [sig_title]     [qr]        |
| [code]                  [sig_name]      [scan_hint] |
+-----------------------------------------------------+
```

## Étapes d'implémentation

1. Migration : ajouter `layout jsonb` sur `certificate_templates` et `partner_programs` (nullable).
2. Refactoriser `certificate.ts` : constantes `DEFAULT_CERTIFICATE_LAYOUT`, corriger la bande basse, brancher le rendu layout-driven avec repli sur le chemin actuel.
3. Créer `src/components/CertificateLayoutEditor.tsx` (drag/resize/panneau props).
4. Ajouter l'onglet « Mise en page » dans `AdminCertificateTemplates.tsx` et dans le dialogue programme de `AdminPartnerCertificates.tsx`.
5. Vérifier l'aperçu PDF (bouton existant) reflète le layout.
