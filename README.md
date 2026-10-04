# Forces de Police Nationale (FPN) — Plateforme de démonstration

Site statique (HTML/CSS/JS), sans installation. Ouvrir `index.html` via un petit serveur :

```
npx -y http-server . -p 8092 -c-1
```
puis http://localhost:8092/

## Les trois niveaux
1. **Vitrine** : accueil, institution, actualités, prévention, recrutement, commissariats (carte), contact, « sécurité en chiffres ».
2. **Espace citoyen** : pré-plainte, signalement cyber, signalement anonyme, objets perdus, rendez-vous DGDI, suivi par numéro, « vérifier un policier », bouton **Alerte 177**.
3. **Espace agents** (`agents.html`) : tableau de bord du commandement, demandes citoyennes, alertes 177 sur carte, main courante, RH, moyens, opérations, concours, journal d'audit.

Tout ce que le citoyen envoie (pré-plainte, alerte, candidature) apparaît côté agents (même navigateur, stockage local de démonstration).

## Comptes de démonstration (espace agents)
Mot de passe : `demo2026` — code de vérification : `123456`

| Matricule | Rôle |
|---|---|
| CMD-001 | Commandement |
| CHF-014 | Chef de commissariat |
| AGT-232 | Agent de terrain |
| RH-007 | Ressources humaines |
| ADM-000 | Administrateur / audit |

Boutons « Entrer en un clic » sur l'écran de connexion. Réinitialiser les données : vider le stockage local du site.

## À valider avant tout usage réel
- Emblème : **emblème de démonstration**, à remplacer par le blason officiel.
- Photos : issues de la presse (droits à confirmer).
- Numéros, adresses et horaires des commissariats : exemples à confirmer.
- Toutes les statistiques, personnes et dossiers affichés dans les espaces sont **fictifs**.
- Aucune alerte ni plainte n'est réellement transmise : en production, API sécurisée, hébergement souverain, double authentification réelle, cadre légal sur les données personnelles.

Site conçu et développé par Rouana.
