---
date: 2015-12-06
title: "ES6, ES2015 : les promesses"
author: Uhsac
oldSlug: js/es2015/promises
slug: es6-es2015-les-promesses
---

ES2015 apporte une fonctionnalité simplifiant grandement l'asynchrone en
JavaScript, les promesses ! Visible depuis longtemps dans l'écosystème
JavaScript grâce a diverses librairies, on peut maintenant utiliser directement
la spécification officielle.

## C'est quoi une promesse ?

Et bien comme son nom l'indique vous pouvez voir ça comme la promesse que vous
allez recevoir une valeur. Comme toute promesse, elle peut être tenue, la valeur
est arrivée et on peut s'en servir, ou ne pas l'être, dans ce cas une erreur
arrive et on peut réagir en conséquence.

Ce mécanisme permet de remplacer les callbacks d'une manière plus élégante. Au
revoir, la suite de callbacks qui rend votre code illisible ! Vous ne me croyez
pas ? Voici un exemple pour vous le prouver :

```js
// En utilisant les callbacks
// Imaginez que chacune de ces fonctions effectue des tâches asynchrones
// plus ou moins complexes (requête HTTP, appel à une base de données
// ou encore lecture de fichier)
const functionWithCallback1 = callback => callback("test", undefined);
const functionWithCallback2 = (arg, callback) => callback(arg, undefined);
const functionWithCallback3 = (arg, callback) => callback(arg, undefined);
const functionWithCallback4 = (arg, callback) => callback(arg, undefined);
const functionWithCallback5 = (arg, callback) => callback(arg, undefined);
const functionWithCallback6 = (arg, callback) => callback(arg, undefined);

functionWithCallback1((result1, err) => {
  if (err) {
    throw err;
  }
  functionWithCallback2(result1, (result2, err) => {
    if (err) {
      throw err;
    }
    functionWithCallback3(result2, (result3, err) => {
      if (err) {
        throw err;
      }
      functionWithCallback4(result3, (result4, err) => {
        if (err) {
          throw err;
        }
        functionWithCallback5(result4, (result5, err) => {
          if (err) {
            throw err;
          }
          functionWithCallback6(result5, (result6, err) => {
            if (err) {
              throw err;
            }
            console.log(`Exemple avec les callback : ${result6}`);
          });
        });
      });
    });
  });
});

// Et maintenant, en utilisant les promesses
const functionWithPromise1 = () => Promise.resolve("test");
const functionWithPromise2 = arg => Promise.resolve(arg);
const functionWithPromise3 = arg => Promise.resolve(arg);
const functionWithPromise4 = arg => Promise.resolve(arg);
const functionWithPromise5 = arg => Promise.resolve(arg);
const functionWithPromise6 = arg => Promise.resolve(arg);

functionWithPromise1()
  .then(functionWithPromise2)
  .then(functionWithPromise3)
  .then(functionWithPromise4)
  .then(functionWithPromise5)
  .then(functionWithPromise6)
  .then(result => console.log(`Exemple avec les promesses : ${result}`))
  .catch(err => {
    throw err;
  });
```

Comme vous pouvez le voir, l'exemple avec les promesses est tout de même plus
lisible !

## Trop bien ! Comment je les utilise ?

Une promesse peut avoir plusieurs états au cours de son existence :

- en cours : la valeur qu'elle contient n'est pas encore arrivée
- résolue : la valeur est arrivée, on peut l'utiliser
- rejetée : une erreur est survenue, on peut y réagir

Une promesse possède 2 fonctions : `then` et `catch`, vous pouvez utiliser
`then` pour récupérer le resultat ou l'erreur d'une promesse et `catch` pour
récupérer l'erreur d'une ou plusieurs promesses.

Voyons comment utiliser les promesses à l'aide de la future implémentation de
[`fetch`](https://fetch.spec.whatwg.org).

```js
// À ce moment, la promesse est en attente
const fetchPromise = fetch("http://putaindecode.io");

// Quand la requête est terminée la promesse est résolue avec le résultat de
// la requête
const parsePromise = fetchPromise.then(fetchResult => {
  // Je peux retourner une nouvelle promesse à partir d'un then, ici
  // j'appelle .text() qui parse le contenu de la requête et retourne
  // une promesse
  return fetchResult.text();
});

// Quand le parsing est terminé, je peux recuperer son contenu
parsePromise.then(textResult => {
  console.log(`Voici le résultat : ${textResult}`);
});

// Si la requête a un problème, la promesse est rejetée avec une erreur
fetchPromise.catch(fetchError => {
  console.log("Une erreur a eu lieu pendant la requête", fetchError);
});

// S'il y a une erreur pendant le parsing, je peux la récupérer
parsePromise.catch(parseError => {
  console.log("Une erreur a eu lieu pendant le parsing", parseError);
});

// Cela peut aussi être écrit
fetch("http://putaindecode.io")
  .then(fetchResult => fetchResult.text())
  .then(textResult => {
    console.log(`Voici le résultat : ${textResult}`);
  })
  .catch(error => {
    console.log(
      "Une erreur a eu lieu pendant la requête ou le parsing",
      fetchError,
    );
  });

// Ou encore
fetch("http://putaindecode.io")
  .then(
    fetchResult => {
      return fetchResult.text();
    },
    fetchError => {
      console.log("Une erreur a eu lieu pendant la requête", fetchError);
    },
  )
  .then(
    textResult => {
      console.log(`Voici le résultat : ${textResult}`);
    },
    parseError => {
      console.log("Une erreur a eu lieu pendant le parsing", parseError);
    },
  );
```

## Mais comment je crée mes propres promesses ?

C'est bien beau d'utiliser les promesses, mais c'est encore mieux de savoir
créer les vôtres ! Je vous rassure, c'est très simple.

```js
const functionThatReturnAPromise = success => {
  // On utilise la classe Promise pour en créer une, le constructeur prend 2
  // fonctions en paramètre :
  // - resolve que l'on pourra appeler avec le résultat de notre fonction
  // - reject que l'on pourra appeler avec une erreur s'il y a une erreur
  return new Promise((resolve, reject) => {
    if (success) {
      resolve("success");
    } else {
      reject("failed");
    }
  });
};

// Vous pouvez maintenant utiliser votre fonction comme vu précédemment
functionThatReturnAPromise(success)
  .then(res => console.log(res))
  .catch(error => console.log(error));

// équivalent dans notre cas à
functionThatReturnAPromise(success).then(
  res => console.log(res),
  error => console.log(error),
);
```

## Et demain ?

Une fonctionnalité encore plus pratique que les promesses arrive en JavaScript,
les mots-clés `async` et `await` ! Ces mots-clés vous permettront d'avoir un
code encore plus lisible quand vous ferez de l'asynchrone, mais ça ne concerne
pas ES2015 :)
