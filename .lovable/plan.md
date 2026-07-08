# Module de diffusion des cours en direct (intégré)

Remplacer Jitsi par un module de diffusion natif : l'instructeur diffuse sa caméra, son micro et éventuellement son écran depuis la plateforme ; les étudiants regardent en direct et discutent dans un chat, sans quitter le site ni ouvrir d'onglet tiers.

## Ce qui change côté utilisateur

- **Instructeur (admin ou rôle enseignant)** : bouton « Démarrer la diffusion » sur la page de session. Aperçu caméra, micro, partage d'écran, indicateur « En direct ». Bouton « Terminer » qui coupe et marque la session comme `ended`.
- **Étudiant** : ouvre la même page `/live/:id`, voit le flux vidéo de l'instructeur, avec chat texte en direct, compteur de participants, et une bannière « hors ligne / en attente » quand l'instructeur n'a pas encore démarré.
- **Admin** : plus de choix « Jitsi » dans le formulaire de session. Deux modes seulement : `Diffusion plateforme` (par défaut) ou `Lien externe` (Zoom / Meet / Teams inchangé).

## Fonctionnement technique

Utilise **WebRTC** navigateur-à-navigateurs pour la vidéo et **Supabase Realtime** pour le signaling et le chat. Aucun serveur média externe.

- **Signaling** : canal Realtime `live:<sessionId>` sur lequel on échange les événements `presence` (qui est là), `offer`, `answer`, `ice-candidate`, `chat`, `stream-state`.
- **Topologie** : SFU-léger côté client — l'instructeur ouvre une `RTCPeerConnection` par étudiant connecté (mesh depuis le broadcaster). Convient jusqu'à ~30-50 spectateurs simultanés, ce qui couvre les cohortes actuelles. Au-delà, on documente la limite ; on pourra brancher un vrai SFU plus tard sans changer l'UX.
- **Chat live** : messages diffusés via le même canal Realtime, stockés en mémoire côté client pendant la session (pas de persistance à cette étape — évolution possible plus tard).
- **Contrôle d'accès** : la page vérifie que l'utilisateur est connecté et inscrit au cursus (règle déjà en place pour `live_sessions.published`), sinon écran d'accès refusé.
- **STUN** : serveurs STUN publics Google (gratuits, standards). Pas besoin de TURN dans la majorité des cas ; on ajoutera un TURN si des étudiants derrière NAT strict échouent.

## Étapes d'implémentation

1. **Migration DB** : renommer `provider = 'jitsi'` en `platform` dans `live_sessions` (compat descendante : les anciennes lignes sont converties). Ajouter `broadcaster_id uuid` et `started_at timestamptz` pour suivre l'état.
2. **Nouveau composant `LiveBroadcast.tsx`** : logique WebRTC + Realtime, deux vues (broadcaster / viewer), overlay chat.
3. **Réécrire `src/pages/LiveSession.tsx`** : détecter le rôle de l'utilisateur (broadcaster si admin ou propriétaire de la session, sinon viewer) et monter `LiveBroadcast`.
4. **Mettre à jour `AdminLiveSessions.tsx`** : retirer l'option Jitsi et le champ `room_name`, garder seulement `Diffusion plateforme` vs `Lien externe`. Le titre de la carte devient « Cours en visio ».
5. **Nettoyage** : retirer toute mention Jitsi dans le code et les commentaires ; garder le lien `/live/:id` inchangé.

## Limites assumées à cette étape

- Diffusion mesh, adaptée aux classes moyennes (jusqu'à ~30-50 viewers). Pas d'enregistrement côté serveur.
- Chat en mémoire (non persistant).
- Un seul broadcaster à la fois par session.

## Détails techniques (section technique)

```text
Broadcaster                Supabase Realtime               Viewers
   |  join channel live:<id> -----------------------> presence sync
   |  <---- viewer joined event -----------------------|
   |  createOffer ---- broadcast:offer(to=viewerId) -->|
   |  <--- broadcast:answer(from=viewerId) -----------|
   |  <--> ice-candidates (both ways) <---------------|
   |                                                   |
   |  MediaStream (getUserMedia + getDisplayMedia)     |
   |  attached to each RTCPeerConnection --------------> <video>
```

- `RTCPeerConnection({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] })`
- Le broadcaster surveille les événements presence pour ouvrir une PC par nouveau viewer et fermer proprement à la déconnexion.
- Les viewers envoient une seule offer en arrivant ; ils reçoivent le flux en tracks distants et le rendent dans un `<video autoplay playsinline>`.
- Le chat utilise `channel.send({ type: 'broadcast', event: 'chat', payload })`.
- Nettoyage : `pc.close()` sur unmount et à la fin de la session, `stream.getTracks().forEach(t => t.stop())`.
