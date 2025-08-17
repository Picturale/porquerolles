# Guide d'utilisation de l'éditeur WYSIWYG direct

## Introduction

L'éditeur de texte WYSIWYG direct (What You See Is What You Get) permet une édition fluide et intuitive du texte, similaire à celle des traitements de texte comme Microsoft Word. Contrairement à l'éditeur précédent, le texte apparaît directement formaté pendant l'édition, sans avoir besoin d'un bouton de prévisualisation séparé.

## Fonctionnalités principales

### 1. Édition directe

- Le texte est formaté immédiatement pendant la saisie
- Aucun code HTML ou Markdown n'est visible
- Interface similaire aux traitements de texte modernes

### 2. Boutons de formatage avec états toggle

Les boutons de mise en forme changent d'aspect lorsqu'ils sont actifs:
- **Gras (B)**: Met le texte sélectionné en gras
- **Alignement**: Aligne le texte à gauche, au centre ou à droite
- **Lien (🔗)**: Ajoute un lien hypertexte au texte sélectionné
- **Séparateur (―)**: Insère une ligne horizontale

### 3. Comportement intelligent

- Les boutons reflètent automatiquement l'état de formatage du texte sélectionné
- En cliquant sur un bouton actif, le formatage est supprimé (toggle)
- Seul un alignement peut être actif à la fois

## Utilisation

1. **Sélectionner du texte**: Cliquez et faites glisser pour sélectionner le texte à formater
2. **Appliquer un format**: Cliquez sur l'un des boutons de la barre d'outils
3. **Supprimer un format**: Sélectionnez le texte formaté et cliquez à nouveau sur le même bouton

## Astuces

- Pour ajouter un lien, sélectionnez d'abord le texte qui servira d'ancre
- Vous pouvez utiliser @nom pour mentionner des utilisateurs (s'affiche en bleu)
- Vous pouvez utiliser #hashtag pour les sujets (s'affiche en couleur)
- Un compteur de caractères en bas indique la longueur du texte

## Avantages par rapport à l'ancien éditeur

- Expérience plus intuitive et familière pour les utilisateurs
- Visualisation immédiate des changements de formatage
- Interface plus propre sans bouton de prévisualisation séparé
- Manipulation directe du texte, sans code visible

## Technique

L'éditeur utilise la technologie contentEditable de HTML5 avec une conversion automatique entre:
- Format d'affichage: HTML pur pour l'interface utilisateur
- Format de stockage: Markdown/HTML mixte pour la base de données

Cette approche permet une expérience d'édition fluide tout en conservant un format de stockage compatible avec le reste de l'application.
