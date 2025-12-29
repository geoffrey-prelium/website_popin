# 📘 Guide Utilisateur : Website Popin & Banner Builder

Ce guide vous explique étape par étape comment créer, diffuser et analyser vos campagnes de popins sur votre site Odoo.

---

## 1. Accéder au Module
1. Connectez-vous à votre interface Odoo (Backend).
2. Allez dans l'application **Site Web**.
3. Dans le menu supérieur, cliquez sur **Configuration** > **Popins & Banners**.

---

## 2. Créer une Nouvelle Campagne
1. Cliquez sur le bouton **Nouveau**.
2. **Nom** : Donnez un nom interne à votre popin (ex: "Solde Été - Newsletter").
3. **Display Type** : Choisissez le format d'affichage :
    *   **Center Modal** : Apparaît au centre de l'écran, assombrit l'arrière-plan. Idéal pour capter l'attention (Newsletters).
    *   **Slide In** : Glisse discrètement depuis le coin bas-droit. Idéal pour des promos non intrusives.
    *   **Banner Top/Bottom** : Bandeau fixe en haut ou en bas. Idéal pour des annonces (Livraison gratuite, Maintenance).
4. **Campaign** (Optionnel) : Associez cette popin à une campagne marketing Odoo (UTM) pour le suivi global.

---

## 3. Design et Contenu (Éditeur de Code)
Le module utilise un **éditeur de code** pour vous garantir un design parfait qui ne sera pas déformé par l'éditeur visuel d'Odoo.

### Comment ajouter du contenu ?
1. Vous voyez un champ noir (zone de code).
2. Collez directement votre code HTML à l'intérieur.

### 🎨 Modèles Prêts à l'Emploi
Copiez-collez ces codes pour démarrer rapidement.

#### A. Newsletter (Pour "Center Modal")
```html
<div class="row g-0 bg-white overflow-hidden rounded shadow-sm" style="max-width: 800px; margin: 0 auto;">
    <div class="col-md-6" style="background: url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80') center/cover; min-height: 300px;"></div>
    <div class="col-md-6 p-5 d-flex flex-column justify-content-center text-start">
        <h3 class="fw-bold mb-3">Restez informé</h3>
        <p class="text-muted mb-4">Inscrivez-vous pour nos offres exclusives.</p>
        <a href="/contactus" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm">S'inscrire</a>
        <p class="text-muted small mt-3 text-center" style="font-size: 0.8rem;">Pas de spam.</p>
    </div>
</div>
```

#### B. Promo Flash (Pour "Slide In")
```html
<div class="d-flex align-items-center bg-white p-3 rounded shadow-lg border-start border-5 border-danger" style="max-width: 350px;">
    <div class="flex-shrink-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
        <i class="fa fa-gift fa-lg"></i>
    </div>
    <div class="flex-grow-1 ms-3">
        <h6 class="fw-bold mb-1">Offre Limitée !</h6>
        <p class="mb-0 small text-muted">-20% code <strong>PROMO20</strong></p>
    </div>
    <a href="/shop" class="btn btn-sm btn-outline-danger ms-2">Profiter</a>
</div>
```

#### C. Bandeau Info (Pour "Banner Top")
```html
<div class="d-flex align-items-center justify-content-center w-100">
    <span class="me-3 fw-bold">🚀 Livraison gratuite dès 50€ !</span>
    <a href="/shop" class="btn btn-sm btn-light text-primary fw-bold rounded-pill px-3">En profiter</a>
</div>
```

---

## 4. Ciblage (Où afficher ?)
Rendez-vous dans l'onglet **Targeting**.

*   **Target Pages** : Sélectionnez des pages spécifiques (ex: `/contactus`). Si vide, la popin peut s'afficher partout (sauf règle inverse).
*   **Target Blog Posts** : Sélectionnez des articles de blog spécifiques.
*   **URL Patterns** : Règles avancées.
    *   `/shop/*` : Cible toutes les pages de la boutique.
    *   `/blog/*` : Cible tout le blog.
    *   `*` : Cible tout le site.

> **Note** : Si vous ne mettez rien dans Pages ou Patterns, la popin s'affichera sur **toutes les pages**.

---

## 5. Déclencheurs (Quand afficher ?)
Rendez-vous dans l'onglet **Triggers**.

*   **Trigger Type** :
    *   **On Page Load** : Immédiat.
    *   **After Delay** : Attendre X secondes (utile pour laisser le temps de lire).
    *   **After Scroll** : Quand l'utilisateur a vu 50% (par défaut) de la page.
    *   **On Exit Intent** : Quand la souris quitte la fenêtre vers le haut (très efficace sur Desktop).
*   **Visitor Type** :
    *   **All Visitors** : Tout le monde.
    *   **New Visitors Only** : Idéal pour une offre de bienvenue (basé sur les cookies).
    *   **Logged In Users** : Pour des annonces internes ou clients fidèles.
*   **Frequency** :
    *   **Every Visit** : Affiche à chaque rechargement (agaçant, bon pour les tests).
    *   **Once per Session** : Une fois jusqu'à la fermeture du navigateur.
    *   **Once every X Days** : (Recommandé) Affiche une fois, puis attend X jours avant de remontrer.

---

## 6. Activation et Test
1. Passez le bouton **Active** au vert (en haut à gauche).
2. Ouvrez une fenêtre de **Navigation Privée** (Incognito).
3. Allez sur votre site et testez le scénario.

---

## 7. Analyser les Performances
Après quelques jours, retournez sur votre popin et cliquez sur l'onglet **Analytics**.

*   **Views** : Nombre d'affichages.
*   **Total Clicks** : Nombre de clics générés.
*   **Links Performance** : Détail de quel lien a été cliqué.
*   **Page Performance** : Sur quelle page la popin convertit le mieux.

---
*Généré par Antigravity pour Odoo 19 - 2025*
