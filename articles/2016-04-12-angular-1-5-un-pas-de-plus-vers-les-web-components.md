---
date: 2016-04-12  
title: "Angular 1.5 : un pas de plus vers les web-components"  
author: Freezystem
oldSlug: js/angular/components
slug: angular-1-5-un-pas-de-plus-vers-les-web-components
---

Ce post a été écrit à la lumière du
[changelog d'Angular 1.5.0 rc1](https://github.com/angular/angular.js/blob/master/CHANGELOG.md#150-rc1-quantum-fermentation-2016-01-15).\
Toutes information est succeptible d'évoluer au cours des publications de nouvelles
versions du framework.

## Le petit nouveau : `.component()`

Avec l'arrivée imminente de la version 2, Angular commence lentement à préparer
la transition et apporte de nombreux changements à la v1 pour tenter de combler
l'écart entre les deux et rendre les changements moins pénibles.

On voit donc progressivement apparaitre de nouvelles fonctionnalités comme :

- ~~un [nouveau router](https://angular.github.io/router/) ?~~
- la possibilité
  d'[annuler une resource](https://docs.angularjs.org/api/ngResource/service/$resource#cancelling-requests)
- les transclusions multiples
- la compilation paresseuse des transclusions

Mais le point qui nous intéresse particulièrement ici n'est autre que le nouveau
_helper_ permettant la déclaration de similis
[composants web](https://fr.wikipedia.org/wiki/Composants_web), aka
web-components.

Les habitués connaissaient déjà
[`angular.directive()`](https://docs.angularjs.org/api/ng/service/$compile), un
_helper_ permettant la déclaration de composants réutilisables.
`angular.directive()` s'est donc enrichi au cours des années en faisant un atout
incontournable du framework de par sa flexibilité et sa simplicité.

Mais toutes ces possibilités de déclaration n'étaient plus vraiment en phase
avec les spécifications du W3C, `angular.component()` se présente donc un retour
aux sources.

## De `.directive()` à `.component()`

Pour comprendre à quoi on arrive, il faut savoir de quoi on est parti. De toute
évidence vous ne pourrez pas transformer toutes vos vieilles directives en
composants web, du moins, pas sans compromis.

Pour rappel une directive Angular est définie par un objet JavaScript pouvant
comporter les attributs suivants :

```js
var directiveObj = {
  template: "<div></div>",
  transclude: false,
  restrict: "EA",
  scope: false,
  bindToController: false,
  controller: function() {},
  controllerAs: "stringIdentifier",
};
```

### Restriction à la forme élémentaire

Ceux qui utilisent les directives Angular de manière régulière ne sont pas sans
savoir qu'il est possible de les instancier de 4 manières différentes dans son
HTML en modifiant l'attribut `restrict` :

- comme un élément avec `restrict : 'E'`
- comme un attribut avec `restrict : 'A'`
- comme une classe avec `restrict : 'C'` (déconseillé)
- comme un commentaire avec `restrict : 'M'` (fortement déconseillé)

On peut aussi autoriser l'utilisation mixe en combinant les lettres :
`restrict : 'EAC'`

`restrict` n'est donc plus configurable et est restreint _(sans mauvais jeu de
mot)_ à la forme `'E'` en faisant un composant de façon claire.

### Isolement du scope

Contrairement à `.directive()`, `.component()` force l'isolement du scope, ainsi
on colle à la specification : le composant web est agnostique du contexte.

l'attribut `scope` est donc forcé à `{}` et n'est plus configurable.

### Passage de paramètres via `bindings`

La propriété `scope` n'étant plus disponible `component`. Il faut à présent
utiliser la propriété `bindings`. La syntaxe de celle-ci est équivalent à celle
de la propriété `scope`. Mais les éléments passés sont automatiquement attachés
à l'instance du contrôleur lié au `component`.

Notons, que s'il reste possible d'utiliser la syntaxe `=` (two-way data
binding), celle-ci est déconseillée au profit de la syntaxe `<` (one-way data
binding).

### Utilisation _forcée_ de `controllerAs`

Déjà présenté comme une
_[best practice](https://toddmotto.com/digging-into-angulars-controller-as-syntax/)_,
`controllerAs` fait son chemin de manière évidente jusqu'au nouveau _helper_
`.component()` son utilisation va de pair avec celle de `bindings`.

L'attribut, qui prend une chaine de caractères pour valeur, est à présent
facultatif. S'il est omit le controller est automatiquement aliassé par l'objet
`$ctrl`.

## Exemple de migration

Prenons l'exemple d'une directive simple et transformons la en composant Angular
pour mettre en évidence l'ensemble des changements :

```html
<hello-world name="World"></hello-world>
```

La syntaxe _directive_ :

```js
angular.directive("helloWorld", function helloWorld() {
  return {
    restrict: "E",
    scope: {},
    bindToController: {
      name: "@",
    },
    controller: function helloWorldCtrl() {
      this.logName = function() {
        console.log(this.name);
      };
    },
    controllerAs: "hw",
    template:
      '<div><span ng-click="hw.logName()">Hello {{hw.name}}!</span></div>',
  };
});
```

La syntaxe _component_ :

```js
angular.component("helloWorld", {
  bindings: {
    name: "@",
  },
  controller: function helloWorldCtrl() {
    this.logName = function() {
      console.log(this.name);
    };
  },
  template:
    '<div><span ng-click="$ctrl.logName()">Hi {{$ctrl.name}}!</span></div>',
});
```

Les changements sont légers mais permettent une lecture améliorée des attributs.
Le composant est donc une version simplifiée de la directive, plus en phase avec
la logique d'Angular 2.

Ce nouveau _helper_ permet donc l'introduction progressive des _web-components_
au sein d'Angular en vue de leur intégration et utilisation active dans la
version 2.
