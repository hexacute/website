---
date: "2016-02-02"
title: "React: Introduction à Relay & GraphQl"
tags:
  - javascript
  - react
  - Relay
  - GraphQL
authors:
  - Nyalab
---

[React](https://github.com/facebook/react) est une librairie se développant à grands pas. Le tooling et la communauté s'agrandissent et les patterns et solutions aux problèmes courants de développement front-end modernes émergent de plus en plus. Si vous ne l'aviez pas encore compris, React n'est qu'une librairie de gestion de vues, et non pas un framework. De ce fait, plusieurs problématiques de développement d'une application ne sont pas solutionnées out of the box par React. L'une de ces problématiques et le thème de cet article est le data fetching.

Facebook a mis le temps avant de publier en open source les solutions qu'ils utilisent en interne. D'autres grands acteurs du web ont donc trouvé entre temps des solutions qui fonctionnent bien, sont stables et répondent à leurs besoins. Je ne parlerais pas de ces solutions dans cet article mais cela ne veut pas dire qu'elles sont inférieures, prenez le temps de les regarder et comparer les implications de leur utilisation. Vous pouvez par exemple décider d'utiliser [Falcor](http://netflix.github.io/falcor/), une libriairie développée par Netflix, ou bien [Redux](https://github.com/rackt/react-redux) avec de simples appels ajax dans vos action creators, ou même encore des bons vieux appels `$.ajax()` dans vos `componentDidMount` avec du `setState()`.

## Relay

### Avantages

Avant d'entrer dans le détail du fonctionnement de Relay, voyons d'abord pourquoi l'utiliser :

#### Le code déclaratif

Comme d'habitude avec la plupart du code React et avec les meilleures parties de son écosystème, la grande partie du code que vous allez écrire sera déclaratif. Relay vous permet de ne plus avoir à écrire de code impératif pour gérer votre data fetching. Vous avez juste à écrire de quoi vous avez besoin en utilisant GraphQL, et Relay se chargera de savoir comment et quand aller chercher vos données.

#### Le regroupement des requêtes avec votre code

Un avantage souvent décrié (JSX, styles inline) jusqu'à ce qu'on l'utilise et qu'on en tombe amoureux. Relay vous laisse écrire vos requêtes au même endroit que vos composants. Celà rend votre code plus simple à écrire et une facilité pour raisonner sur votre application.

#### Les mutations

Relay vous laisse muter vos données côté client et côté serveur en utilisant la syntaxe des mutations GraphQL. Cela vous permet d'avoir de la consistence de données automatique, les [mises à jour optimistes](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) et automatiquement de la gestion d'erreurs.

#### La précision des requêtes

À l'heure où la séparation des métiers front & back est la plus forte, Relay permet au développeur d'applications front de spécifier précisément des données dont il a besoin. Cela apporte au moins deux avantages : les composants ont des besoins en données plus concis et précis ce qui les rend plus explicites, et ça allège le poids des trames réseau (on ne demande au back qu'exactement ce dont nous avons besoin).

#### Le prefetch de toutes les données nécessaires à une page

Le fonctionnement de Relay fait qu'il va aggréger toutes les dépendances aux données de vos composants pour n'en sortir qu'une seule et grosse requête qu'il enverra en une seule fois au back. Une fois que le serveur aura répondu, Relay s'occupera ensuite de redécouper et redistribuer vos données aux bons composants. Ceux-ci récupèreront uniquement les données qu'ils ont demandé.

### Utilisation

J'aurais pu lister encore plus d'avantages à Relay, mais ce sont souvent des incidences croisées entre ceux que j'ai listé précédemment qui font sa force. Je vous montrerais plus loin dans l'article quelques exemples pour prouver mes propos, passons maintenant à l'utilisation.

La responsabilité de Relay est de faire le lien entre vos composants React et votre API GraphQL. Pour répondre à cette problématique, Relay va vous fournir quelques outils : les *fragments*, les *mutations* et les *conteneurs*.

#### Les fragments

#### Les mutations

#### Les conteneurs

### Les exemples qui prouvent la force de Relay

#### La pagination

```js
class Feed extends React.Component {
  loadMore() {
    const count = this.props.relay.count + 10
    this.props.relay.setVariables({count})
  }
}
```

#### La réusabilité

#### La souscription automatique

## GraphQL
