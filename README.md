# Constructeur de Popins & Bannières pour Odoo

**Website Popin & Banner Builder** est un outil marketing puissant pour Odoo qui vous permet de créer, gérer et suivre des popups, modales et bannières hautement personnalisables sur votre site web.

Que vous souhaitiez capturer des leads avec une inscription à la newsletter, promouvoir une vente flash ou afficher une annonce importante, ce module vous offre la flexibilité de cibler la bonne audience au bon moment.

## 🚀 Fonctionnalités Clés

### 🎨 Types d'Affichage Flexibles
- **Center Modal** : Popup classique pour un engagement fort (ex: Newsletter).
- **Slide In** : Notification discrète glissant depuis le bas-droit.
- **Top/Bottom Banner** : Barres pleine largeur pour les annonces.
- **HTML Personnalisé** : Contrôle total sur le design grâce à l'éditeur de code intégré.

### 🎯 Ciblage Précis
- **Ciblage par Page** : Affichage sur des pages spécifiques ou des articles de blog.
- **Modèles d'URL** : Utilisez des jokers (ex: `/shop/*`) ou des regex pour cibler des sections de votre site.
- **Ciblage Visiteur** : Ciblez les **Nouveaux Visiteurs**, **Visiteurs Récurrents**, **Utilisateurs Connectés**, ou tout le monde.

### ⚡ Déclencheurs Intelligents & Fréquence
- **Au Chargement (On Page Load)** : Affichage immédiat.
- **Après Délai** : Attendre X secondes avant d'afficher.
- **Au Défilement (On Scroll)** : Déclenchement quand l'utilisateur défile X% de la page.
- **Intention de Sortie (Exit Intent)** : Déclenchement quand la souris quitte la fenêtre (haut).
- **Limitation de Fréquence** : Afficher une fois par session, à chaque visite, ou tous les X jours.

### 📊 Analytique Intégrée
- **Suivi des Vues** : Comptez combien de fois chaque popin est affichée.
- **Suivi des Clics** : Suivez automatiquement les clics sur n'importe quel lien dans votre popin.
- **Statistiques par Page** : Voyez quelles pages performent le mieux pour vos popins.

## 🛠️ Installation

1. Clonez ou placez le dossier `website_popin` dans votre dossier addons Odoo.
2. Mettez à jour la liste des applications dans Odoo (Applications > Mise à jour de la liste).
3. Recherchez **Website Popin & Banner Builder** et installez-le.

## 📖 Guide d'Utilisation

### Créer une Popin
1. Allez dans **Site Web > Configuration > Popins & Banners**.
2. Cliquez sur **Nouveau**.
3. **Nom** : Donnez un nom interne (ex: "Promo Été").
4. **Type d'Affichage** : Choisissez comment elle doit apparaître.
5. **Contenu** :
    - L'éditeur est un **Éditeur de Code**.
    - Collez votre code HTML directement pour un contrôle maximum.
    - *Astuce : Utilisez les classes Bootstrap (ex: `d-flex`, `bg-white`, `shadow`) pour un style instantané.*
6. **Ciblage & Déclencheurs** : Configurez où et quand elle apparaît.
7. **Active** : Activez l'interrupteur pour la publier.

### Analytique
Une fois active, allez dans l'onglet **Analytics** de votre popin pour voir :
- Le total des Vues et Clics.
- Le détail par Page et par Lien.

## 💻 Détails Techniques
- **Frontend** : JS léger (sans dépendance jQuery pour la logique coeur) gérant les déclencheurs et cookies.
- **Backend** : Contrôleurs Python pour un ciblage efficace et la collecte de statistiques.
- **Performance** : Les popins sont chargées de manière asynchrone pour ne pas bloquer le chargement initial de la page.

---
*Développé pour Odoo 19.*
