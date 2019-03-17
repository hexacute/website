---
date: 2019-01-22
title: "Comprendre le CSS in JS par l'exemple"
author: zoontek
oldSlug: js/css-in-js
slug: comprendre-le-css-in-js-par-l-exemple
---

Il se peut que vous entendiez beaucoup parler de CSS-in-JS dernièrement. C'est
un sujet de polémique bien connu dans le milieu du front-end actuel : les
argumentaires tournent en boucle, souvent biaisés par les habitudes et / ou les
conditions de travail de chaque partie.

Afin de mieux comprendre ce qu'est le CSS-in-JS, nous allons créer une librairie
similaire à [Emotion](https://emotion.sh/) ou
[Glamor](https://github.com/threepointone/glamor). Au fur et à mesure de la
réalisation, nous pourrons nous apercevoir qu'il est parfois possible d'améliorer
l'expérience de développement en prévenant certaines erreurs humaines et en
automatisant certaines choses.

Notre librairie nous permettra d'insérer des styles de façon sûre, de gérer les
pseudo-classes et les pseudo-éléments et de fournir un moyen de gérer le
responsive.

## Initialisation du projet

Pour plus de sécurité et de confort, nous allons utiliser
[TypeScript](http://www.typescriptlang.org). Copiez / collez la commande
suivante pour créer et lancer un nouveau projet sobrement intitulé
`putain-de-css`.

```sh
npx create-react-app putain-de-css \
  && cd putain-de-css \
  && npm i -D typescript \
  && npm i -S @types/node @types/react-dom @types/react \
  && rm -rf src && mkdir src \
  && echo \
'import * as React from "react";
import { render } from "react-dom";

const App = () => <h1>Hello world</h1>;
render(<App />, document.getElementById("root"));' \
> src/index.tsx \
  && npm start
```

Ouvrez votre éditeur de code préféré, on attaque directement en créant un
nouveau fichier `src/css.ts`.

## Insertion de style sous la forme de string

La première chose à faire pour pouvoir insérer des styles au sein du CSSOM,
c'est de créer un élément DOM `<style>` dans le `<head>` de notre document, puis
de récupérer l'objet de type `CSSStyleSheet` qui lui est attaché.

```js
// src/css.ts

const styleEl = document.createElement("style");
styleEl.appendChild(document.createTextNode(""));
document.head.appendChild(styleEl);

const sheet = styleEl.sheet as CSSStyleSheet;
```

À la suite, nous allons créer une fonction simple qui insère une règle CSS et
nous prévient des règles malformées en développement. Pour rappel, une règle est
constituée de la façon suivante :
`selector { property: value; property: value; … }`).

```js
// src/css.ts
// …

export function insertRule(rule: string) {
  try {
    sheet.insertRule(rule);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Malformated CSS: "${rule}"`);
    }
  }
}
```

Nous pouvons dès à présent importer cette fonction au sein de notre fichier
`index.tsx` et tenter plusieurs essais.

```js
// src/index.tsx
// …

import { insertRule } from "./css";

// testons d'abord:
insertRule("h1 { color: hotpink }");
// puis:
insertRule("1nvalid! { color: red }");

const App = () => <h1>Hello world</h1>;

// …
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/1.png" alt="résultat avec un style objet" />
  <figcaption>Quand tout va bien</figcaption>
</figure>

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/2.png" alt="résultat avec un style objet" />
  <figcaption>Quand tu tapes n'importe quoi</figcaption>
</figure>

## Insertion de style sous la forme d'objets

Écrire nos règles sous la forme de string est plutôt risqué : la chaîne de
caractère sera complexe à parser et à analyser. Nous nous exposons donc à
certains risques si nous ne pensons pas à prévoir certains cas.

De plus, si une équipe de développeurs peut insérer absolument tout ce qu'elle
souhaite dans la feuille de style, elle pourra donc utiliser l'intégralité des
sélecteurs CSS. Il faudrait donc faire appel à beaucoup de rigueur ou se reposer
sur plusieurs outils supplémentaires (extensions IDE, linter, etc.).

Nous allons donc créer une fonction supplémentaire pour transformer un objet en
règle insérable et dont le sélecteur sera un nom de classe généré et unique.

Nous allons également créer quelques types assez basiques en haut de notre
fichier.

```js
// src/css.ts

// "Value" peut être de type string OU number
type Value = string | number;

// "Style" est un objet dont les valeurs sont de type Value
export type Style = {
  [name: string]: Value,
};

// …

export function insertStyle(style: Style) {
  const content = Object.keys(style)
    .map(name => `${name}: ${style[name]}`)
    .join("; ");

  insertRule(`h1 { ${content} }`);
}
```

À ce point, vous pouvez importer `insertStyle` et vous en servir, vous
constaterez que cela a l'effet escompté… sur notre `h1` pour le moment.

```js
// src/index.tsx
// …

import { insertStyle } from "./css";

insertStyle({
  color: "hotpink",
  "text-decoration": "underline",
});

// …
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/3.png" alt="résultat avec un style objet" />
</figure>

Afin de créer un nom de classe unique, il nous faut hacher notre règle CSS. Cela
consiste à transformer la donnée entrée en "empreinte" permettant d'identifier
celle-ci. Ainsi, deux objets au contenu identique et ordonnés de la même façon
auront tous deux la même empreinte. L'objectif étant que si plusieurs objets de
style possèdent un contenu identique, celui-ci ne sera inséré d'une seule fois.

Une fonction de hashage qui nous conviendrait est le `murmurhash2` disponible
sur `npm`.

```sh
npm i -S murmurhash @types/murmurhash
```

Nous pouvons dès à présent générer un nom de classe en fonction du contenu de
notre règle CSS.

```js
// src/css.ts

import murmurhash from "murmurhash";

// …

function hash(str: string) {
  // on retourne un string encodé en base 36
  return murmurhash.v2(str, 1).toString(36);
}

export function insertStyle(style: Style) {
  const content = Object.keys(style)
    .map(name => `${name}: ${style[name]}`)
    .join("; ");

  const className = "css-" + hash(content);
  insertRule(`.${className} { ${content} }`);

  return className;
}
```

Et même l'appliquer sur notre composant React / élément HTML / ce que vous
voulez !

```js
// src/index.tsx
// …

import { insertStyle } from "./css";

const className = insertStyle({
  color: "hotpink",
  "text-decoration": "underline",
});

// on applique la classe créée
const App = () => <h1 className={className}>Hello world</h1>;
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/4.png" alt="résultat avec nom de classe généré" />
</figure>

## Propriétés en lowerCamelCase

Créons une nouvelle fonction juste avant `insertStyle`. Celle-ci va remplacer
toutes les majuscules de notre paramètre de type `string` par un hyphen + sa
minuscule.

Elle gère également le cas un peu spécial des préfixes Microsoft (qui ne
commencent pas par une majuscule, contrairement à ceux de Mozilla / WebKit).

```js
// src/css.ts
// …

// expected outputs:
// fontFamily -> font-family
// MozTransform -> -moz-transform
// msTransform -> -ms-transform
// WebkitTransform -> -webkit-transform

function hyphenateName(name: string) {
  return name
    .replace(/([A-Z])/g, (_, letter) => `-${letter.toLowerCase()}`)
    .replace(/^ms-/, "-ms-");
}

export function insertStyle(style: Style) {
  const content = Object.keys(style)
    // on ajoute l'hyphenation du nom ici
    .map(name => `${hyphenateName(name.trim())}: ${style[name]}`)
    .join("; ");

  const className = "css-" + hash(content);
  insertRule(`.${className} { ${content} }`);

  return className;
}
```

En modifiant notre appel à `insertStyle` dans `index.tsx`, on s'aperçoit que
tout fonctionne comme espéré.

```js
// src/index.tsx
// …

const className = insertStyle({
  color: "hotpink",
  textDecoration: "underline", // plus d'hyphens!
});

//…
```

## Gestion des valeurs de fallback

Parce qu'en CSS il est possible de faire:

```css
display: -webkit-flex;
display: -moz-flex;
display: flex;
```

Mais que la nature des objets JavaScript ne nous le permet pas (impossible
d'avoir plusieurs clés identiques), il nous faut pouvoir prendre un tableau en
valeur.

```js
// src/css.ts
//…

// on commence par modifier le type Value
type Value = string | number | Array<string | number>;

// …

// on externalise la "cssification" en 2 fonctions

// cssifyDeclaration retourne "nom: valeur" si la valeur est correcte
function cssifyDeclaration(name: string, value: any) {
  if (
    (typeof value === "string" && value !== "") ||
    (typeof value === "number" && isFinite(value))
  ) {
    return `${name}: ${(value + "").trim()}`;
  }
}

// compactDeclarations filtre les falsy values et compacte le reste avec "; "
function compactDeclarations(declarations: (string | undefined)[]) {
  return declarations.filter(declaration => !!declaration).join("; ");
}

export function insertStyle(style: Style) {
  const declarations = Object.keys(style).map(name => {
    const hName = hyphenateName(name).trim();
    const value = style[name];

    return Array.isArray(value)
      ? compactDeclarations(value.map(fbv => cssifyDeclaration(hName, fbv)))
      : cssifyDeclaration(hName, value);
  });

  const content = compactDeclarations(declarations);
  const className = "css-" + hash(content);
  insertRule(`.${className} { ${content} }`);

  return className;
}
```

Si on modifie le style appliqué sur notre `<h1>` de cette façon :

```js
// src/index.tsx
// …

const className = insertStyle({
  color: "hotpink",
  textDecoration: "underline",
  display: ["-webkit-flex", "-moz-flex", "flex"],
});

// …
```

On constate que le navigateur ne nous indique pas que 3 valeurs ont été insérées
(en barrant celles qui ne sont pas appliquées).

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/5.png" alt="inspection des styles préfixés" />
</figure>

En effet, lorsque vous utilisez `insertRule`, seule la dernière valeur comprise
par le navigateur est réellement insérée. Ainsi, si on change la valeur de
`display` pour `["flex", "-webkit-flex", "-moz-flex"]`, vous verrez que seul
`-webkit-flex` sera appliqué (si bien sûr vous utilisez un navigateur qui
comprend les préfixes WebKit mais pas les préfixes Mozilla).

## Gestion des pseudo-classes / éléments

L'idée c'est de les déclarer directement au sein de notre déclaration de style,
si possible de façon infiniment nestés.

On modifie donc l'exemple pour visualiser le but à atteindre :

```js
// src/index.tsx
// …

const className = insertStyle({
  color: "hotpink",
  textDecoration: "underline",

  ":hover": {
    color: "rebeccapurple",

    "::first-letter": {
      color: "cyan",
    },
  },
});

// …
```

Idéalement, il nous faudrait une fonction qui aplatisse ce style par suffixe
appliqué à notre classe, de cette façon :

```js
{
  "": "color: pink; text-decoration: underline",
  ":hover": "color: rebeccapurple",
  ":hover::first-letter": "color: cyan",
};
```

```js
// src/css.ts
// …

// on modifie le type Style
export type Style = {
  [name: string]: Value | Style,
};

function isPlainObject(value: any) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function flattenStyle(style: Style, suffix: string = "") {
  let result: { [suffix: string]: string | undefined } = {
    // on s'assure que le sélecteur "racine" est le premier inséré
    [suffix]: undefined,
  };

  // on extrait la logique qui était précedemment dans insertStyle
  const declarations = Object.keys(style).map(name => {
    const value = style[name];

    if (isPlainObject(value)) {
      if (process.env.NODE_ENV !== "production") {
        // on peaufine un peu la DX (et on évite quelques edge-cases)
        if (!/^::?(-webkit-|-moz-|-ms-)?[a-z][a-z-]+(\(.+\))?$/.test(name)) {
          throw new Error(`Invalid pseudo class / element: "${name}"`);
        }
      }

      const nested = flattenStyle(value as Style, `${suffix}${name}`);

      Object.keys(nested).forEach(nName => {
        result[nName] = nested[nName];
      });
    } else {

      const hName = hyphenateName(name).trim();

      return Array.isArray(value)
        ? compactDeclarations(value.map(fbv => cssifyDeclaration(hName, fbv)))
        : cssifyDeclaration(hName, value);
    }
  });

  result[suffix] = compactDeclarations(declarations);
  return result;
}
```

Si on passe notre style dans cette fonction `flattenStyle` afin d'en analyser la
sortie, on constate qu'elle fait exactement ce que l'on souhaite.

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/6.png" alt="valeur retournée par la fonction flattenStyle" />
</figure>

Il ne nous reste qu'à hasher la représentation de cet objet et insérer les
règles une par une.

```js
// src/css.ts
// …

export function insertStyle(style: Style) {
  const flattened = flattenStyle(style);
  const className = "css-" + hash(JSON.stringify(flattened));

  Object.keys(flattened).forEach(suffix => {
    insertRule(`.${className}${suffix} { ${flattened[suffix]} }`);
  });

  return className;
}
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/7.png" alt="résultat avec gestion du hover" />
</figure>

## Concaténation de styles

Une pratique assez répandue est d'appliquer conditionnellement plusieurs objets
styles en fonction de l'état de nos composants.

```js
// ce genre de chose
css(styles.base, this.props.disabled && styles.disabled);
```

Supprimez tous les exports de fonction du fichier `css.ts`, nous n'allons en
garder qu'un seul, celui par défaut : cette fameuse fonction `css` !

```js
// src/css.ts
// …

export type MaybeStyle = Style | false | null | undefined;

// …

// renommez la fonction ìnsertStyle
// elle accepte à présent des styles, mais aussi des "falsy values"
function css(...styles: MaybeStyle[]) {
  const flattened = styles
    // on ne garde que les objets
    .filter(style => isPlainObject(style))
    .map(style => flattenStyle(style))
    .reduce((flat, style) => {
      Object.keys(style).forEach(suffix => {
        flat[suffix] = flat[suffix]
          ? `${flat[suffix]}; ${style[suffix]}`
          : style[suffix];
      });
      return flat;
    }, {});

  const className = "css-" + hash(JSON.stringify(flattened));

  Object.keys(flattened).forEach(suffix => {
    insertRule(`.${className}${suffix} { ${flattened[suffix]} }`);
  });

  return className;
}
```

Je vous laisse ça afin de faire un test rapide:

```js
// src/index.tsx
// …

import css from "./css";

const className = css(
  {
    color: "hotpink",
    textDecoration: "underline",

    ":hover": {
      color: "rebeccapurple",
    },
  },
  {
    color: "red",

    ":hover": {
      color: "blue",
    },
  },
);

// …
```

## Autoprefixing

Il est temps de peaufiner un peu l'expérience de développement. Si je vous dit
qu'on a implémenté toutes les features nécessaires pour utiliser l'équivalent
d'un autoprefixer (qui préfixe automatiquatiquement les propriétés pour un
meilleur support navigateur)?

Il s'agit d'[inline-style-prefixer](https://inline-style-prefixer.js.org).

```sh
npm i -S inline-style-prefixer @types/inline-style-prefixer
```

```js
// src/css.ts

import { prefix } from "inline-style-prefixer";

// …

function css(...styles: Style[]) {
  const flattened = styles
    .filter(style => isPlainObject(style))
    // on ajoute l'appel ici
    .map(style => flattenStyle(prefix(style) as Style))
    // …
```

Et c'est tout! 😀

## Autocomplétion

Le CSS-in-JS, ça peut vous rebuter quand on voit le tooling actuellement
disponible pour le CSS. L'autocomplétion dans les éditeurs de texte est quali,
ça serait bien d'avoir quelque chose de similaire… Ça tombe bien, nous utilisons
un langage typé.

```sh
npm i -S csstype
```

```js
// src/css.ts

import { PropertiesFallback, SimplePseudos } from "csstype";

//…

// remplacez Style par ceci
export type Style = PropertiesFallback &
  { [pseudo in SimplePseudos]?: PropertiesFallback };

// on en profite pour ajouter un type StyleSheet
export type StyleSheet = { [key: string]: Style };

// …
function flattenStyle(style: Style, suffix: string = "") {
  let result: { [suffix: string]: string | undefined } = {
    [suffix]: undefined,
  };

  const declarations = Object.keys(style).map(name => {
    const value = (style as any)[name] as Value; // on force le type ici
    // …
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/8.png" alt="démo de l'autocomplétion" />
</figure>

## Performances

Comme vous vous en doutez, pour le moment notre lib n'est pas un foudre de
guerre : aucun système de cache n'est présent. Comme on désire tout de même
briller dans les benchmarks, tâchons d'optimiser ça.

Pour cela on va utiliser la mémoïsation (on utilise lodash par commodité, mais
on peut faire plus léger).

Pour ceux qui ne sont pas familiers avec le concept, cela nous permet de wrapper
une fonction. Lors du premier appel, la fonction est appelée normalement, son
résultat est stocké dans un objet. Lors des appels suivants, les calculs ne
seront plus effectués, le résultat en cache sera directement retourné.

```sh
npm i -S lodash.memoize @types/lodash.memoize
```

Trève de bavardages, on importe ça dans notre fichier `css.ts` et on optimise 😄

```js
// src/css.ts

import memoize from "lodash.memoize";

// …

// on peut mémoïser la fonction hyphenateName de façon à
// ce que chaque règle ne soit convertie qu'une seule fois
const hyphenateName = memoize(name => {
  return name
    .replace(/([A-Z])/g, (_, letter) => `-${letter.toLowerCase()}`)
    .replace(/^ms-/, "-ms-");
});

// …

// on retire le export default
function css(...styles: Style[]) {
  // …
}

// on exporte par défaut la fonction mémoïsée
// le deuxième argument sert à générer une clé pour l'élément en cache
export default memoize(css, (...styles) => JSON.stringify(styles));
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/9.png" alt="benchmark avant optimisation" />
  <figcaption>Avant mémoïsation</figcaption>
</figure>

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/10.png" alt="benchmark après optimisation" />
  <figcaption>Après mémoïsation</figcaption>
</figure>

À savoir qu'il existe d'autres techniques de caching, notamment à base de
`WeakMap`.

# Intégration avec React

Parce qu'on adore React chez P!, je ne peux m'empêcher de conclure sans vous
montrer comment utiliser au mieux cette lib avec React. Créez un fichier
`react.tsx`, c'est parti !

```js
// src/react.tsx

import * as React from "react";
import cssFn, { MaybeStyle } from "./css";

// on augmente les types des éléments DOM
declare module "react" {
  interface HTMLAttributes<T> {
    css?: MaybeStyle | MaybeStyle[];
  }

  interface SVGAttributes<T> {
    css?: MaybeStyle | MaybeStyle[];
  }
}

// on override la fonction createElement de React
export function createElement<
  P extends {
    css?: MaybeStyle | MaybeStyle[];
    className?: string;
  }
>(
  Component: React.ComponentType<P> | string,
  props: P,
  ...children: React.ReactElement<any>[]
) {
  // si le composant n'est pas un tag HTML ou qu'il
  // ne possède pas de prop CSS, on ne fait rien
  if (typeof Component !== "string" || !props.css) {
    return React.createElement(Component, props, ...children);
  }

  const { css, className, ...rest } = props;

  // on transforme notre style en className, on l'ajoute
  // à la suite du className existant (si il existe)
  const newClassName =
    (className ? `${className} ` : "") +
    (Array.isArray(css) ? cssFn(...css) : cssFn(css));

  return React.createElement(
    Component,
    { ...rest, className: newClassName },
    ...children,
  );
}
```

Comment on se sert de tout ça ? Facile : on retourne dans le fichier
`index.tsx`.

```js
// src/index.tsx
// …

import { StyleSheet } from "./css";
import { createElement } from "./react";
/* @jsx createElement */

// puisque TS supprime l'import s'il ne sert que pour le pragma JSX,
// on laisse trainer la valeur. Pas idéal, mais ça fait le taf.
// voir https://github.com/babel/babel/issues/8958
createElement;

const styles: StyleSheet = {
  base: {
    color: "hotpink",
    textDecoration: "underline",
  },
  fancy: {
    "::first-letter": {
      fontSize: "2em",
    },
  },
};

type State = {
  isFancy: boolean,
};

class App extends React.Component<{}, State> {
  state = {
    isFancy: false,
  };

  render() {
    return (
      <>
        <h1 css={[styles.base, this.state.isFancy && styles.fancy]}>
          Hello world
        </h1>

        <button
          onClick={() => {
            this.setState(prevState => ({ isFancy: !prevState.isFancy }));
          }}
        >
          Toggle fancy mode
        </button>
      </>
    );
  }
}

// …
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/11.gif" alt="résultat de l'exemple" />
</figure>

Si vous êtes fan de `styled-components` (personnellement je déteste ça, mais
chacun son truc), il est extrêmement simple de recréer une API similaire :

```js
// src/react.tsx
// …

export function styled<T extends string, P extends object>(
  Component: T,
  style: Style | ((props: P) => Style),
) {
  return (props: P & React.HTMLProps<T>) => {
    const { children, ...rest } = props;
    const css = typeof style === "function" ? style(props) : style;

    return createElement(
      Component,
      { ...rest, css },
      ...(children as React.ReactElement<any>[]),
    );
  };
}
```

(Oui, c'est tout 🤭)

```js
// src/index.tsx
// …

import { styled } from "./react";

// notre typage de props est mergé avec le typage de l'élément h1
const Title = styled("h1", (props: { fancy?: boolean }) => ({
  color: "hotpink",
  textDecoration: "underline",

  ...(props.fancy && {
    "::first-letter": {
      fontSize: "2em",
    },
  }),
}));

type State = {
  isFancy: boolean,
};

class App extends React.Component<{}, State> {
  state = {
    isFancy: false,
  };

  render() {
    return (
      <>
        <Title fancy={this.state.isFancy}>Hello world</Title>
        {/* … */}
```

## Gérer le responsive

Les media-queries c'est pas mal, mais au sein d'une approche composant,
appliquer des styles par rapport aux dimensions de la totalité du viewport,
c'est fort dommage.

Nous allons donc utiliser
[`ResizeObserver`](https://developers.google.com/web/updates/2016/10/resizeobserver).
Le support n'est pas fou (uniquement Chrome à l'heure où j'écris ces lignes),
mais heureusement un polyfill existe.

```sh
npm i -S resize-observer-polyfill
```

On retourne dans le fichier `react.tsx`:

```js
// src/react.tsx

import ResizeObserver from "resize-observer-polyfill";

// …

type OnResizeCallBack = (
  dimensions: {
    height: number;
    width: number;
  },
) => void;

declare module "react" {
  interface HTMLAttributes<T> {
    css?: MaybeStyle | MaybeStyle[];
    onResize?: OnResizeCallBack; // on ajoute le callback en prop
  }

  interface SVGAttributes<T> {
    css?: MaybeStyle | MaybeStyle[];
    onResize?: OnResizeCallBack;
  }
}

// on va stocker les callbacks par élément HTML
const callbacks: Map<Element, OnResizeCallBack> = new Map();

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const callback = callbacks.get(entry.target);

    if (callback) {
      const { height, width } = entry.contentRect;
      callback({ height, width });
    }
  }
});

class Resizable extends React.Component<{
  render: (ref: React.RefObject<Element>) => React.ReactElement<any>;
  onResize: OnResizeCallBack;
}> {
   // il est aussi possible d'utiliser forwardRef
  ref: React.RefObject<Element> = React.createRef();

  componentDidMount() {
    if (this.ref.current) {
      callbacks.set(this.ref.current, this.props.onResize);
      observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    if (this.ref.current && callbacks.has(this.ref.current)) {
      callbacks.delete(this.ref.current);
      observer.unobserve(this.ref.current);
    }
  }

  render() {
    return this.props.render(this.ref);
  }
}

export function createElement<
  P extends {
    css?: MaybeStyle | MaybeStyle[];
    className?: string;
    onResize?: OnResizeCallBack;
  }
>(
  Component: React.ComponentType<P> | string,
  props: P,
  ...children: React.ReactElement<any>[]
) {
  if (typeof Component !== "string" || !props.css) {
    return React.createElement(Component as any, props, ...children);
  }

  const { css, className, onResize, ...rest } = props;

  const newClassName =
    (className ? `${className} ` : "") +
    (Array.isArray(css) ? cssFn(...css) : cssFn(css));

  if (onResize) {
    return (
      <Resizable
        onResize={onResize}
        render={ref =>
          React.createElement(
            Component,
            { ...rest, ref, className: newClassName },
            ...children,
          )
        }
      />
    );
  }

  return React.createElement(
    Component,
    { ...rest, className: newClassName },
    ...children,
  );
}
```

Et pour ce qui est de l'usage:

```js
// src/index.tsx
// …

import { StyleSheet } from "./css";
import { createElement } from "./react";
/* @jsx createElement */
createElement; // fix pour TS

const styles: StyleSheet = {
  base: {
    backgroundColor: "hotpink",
    height: "300px",
    maxWidth: "300px",
  },
  small: {
    backgroundColor: "rebeccapurple",
  },
};

type State = {
  width: number | null,
};

class App extends React.Component<{}, State> {
  state = { width: null };

  render() {
    const { width } = this.state;

    return (
      <div
        css={[
          styles.base,
          // on cache l'élément tant que ses dimensions ne sont pas dispos
          width ? width < 200 && styles.small : { visibility: "hidden" },
        ]}
        onResize={({ width }) => {
          this.setState({ width });
        }}
      />
    );
  }
}

// …
```

<figure>
  <img src="/public/images/articles/2019-01-22-comprendre-le-css-in-js-par-l-exemple/12.gif" alt="résultat responsive" />
</figure>

Il est temps de conclure ! Comme vous avez pu le constater, notre errance dans
le CSSOM nous a permis de créer une abstraction qui :

- est déterministe (le nom de la classe est généré en fonction du style),
- nous évite de nous soucier de la spécificité des sélecteurs CSS,
- isole le style par composant et empêche un tas de comportements inattendus,
- nous permet de gérer le responsive sans se soucier du contexte.

Si vous ne comprenez pas certains points ou si vous avez des questions supplémentaires,
n'hésitez pas à poster un commentaire, je me ferai une joie d'y répondre.

La bise 😘
