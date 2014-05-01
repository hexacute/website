Mardi 29 avril s'est déroulée la troisième table ronde qui est finalement la première sous le nom de **{p!}**. Une petite explication s'impose étant donné que nous allons en faire de plus en plus et que je souhaite vraiment vous faire un compte rendu sur chacun de ces évènements.

## Préambule

Partant du constant qu'il est difficile d'apprendre et d'échanger en conférence du fait du manque du niveau assez élevé (trop de gens avec un niveau différent, il faut forcément s'aligner) et à sens unique (une personne parle, les autres écoutent), nous avons décidé de créer des tables rondes où un fil conducteur est suivi amenant à débattre, échanger, affirmer.

Attention, je ne dis pas que les conférences ne servent à rien mais à mon sens elles sont trop magistrales et parfois trop marketing (coucou WebRTC Paris).

Les premières tables rondes n'étaient pas sous le nom de **p!**, elles étaient plutôt de mon initiative (@_kud) dans le but de rassembler des gens que j'appréciais et dont je connaissais le niveau afin de progresser tous ensembles.

Je tiens à vous mettre en garde ici que les propos tenus ne sont pas forcément toujours justifiés, c'est un compte rendu qui synthétise des choix que vous devriez sûrement explorer par vous-même ou au travers de d'autres articles **p!**.

Bon allez, on y va.

## Où ?

C'est cette fois-ci Altima qui nous a gentillement accueilli dans ses locaux.

[Altima](http://www.altima.fr) est une agence web composée de 6 bureaux dans le monde, proposant des expertises notamment dans les domaines du design, UX, SEO, in-store, hosting, et développement.

On les remercie bien fort, tout était nickel.

## Thèmes

Voici le fil conducteur de la soirée.

- les resets / normalize, lesquels, pourquoi, quand ?
- stratégie de dossiers / fichiers (architecture)
- OOCSS, BEM, SMACSS, Atomique etc.
- sémantique
- accessibilité
- les pièges de l'intégration (e.g. display: inline-block)
- unités px, rem, em, pt
- CSS Frameworks ? lesquels ? pourquoi ? quand ?

## Qui ?

Voici les personnes présentes. Si vous avez d'ailleurs le moindre problème avec ce qui est dit dans cet article, c'est à eux que vous devriez vous adresser. 😊

Membres | Statut |
--------|:------:|
[_kud](https://twitter.com/_kud) | 👮 |
[bloodyowl](https://twitter.com/bloodyowl) | 🏠 |
[yannickc](https://twitter.com/yannickc) | |
[dhoko_](https://twitter.com/dhoko_) | |
[philippebarbosa](https://twitter.com/philippebarbosa) | |
[tchak13](https://twitter.com/tchak13) | |
[remitbri](https://twitter.com/remitbri) | |
[dizwix](https://twitter.com/dizwix) | |

## C'est parti

### Reset / Normalize

Bon, alors, commençons. Ce sont évidemment les resets / normalizes qui débutent étant donné que c'est la base de toute intégration.

Pour rappel, la différence entre un normalize et un reset est simple.

- Le **normalize** fait en sorte que les styles de base se ressemblent sur tous les navigateurs.
- Le **reset** va plus loin que ça puisqu'il s'occupe d'écraser totalement les styles par défaut pour finalement n'avoir aucun style sur votre page lorque vous débutez votre intégration.

Bref, peu ou pas de gens dans cette salle utilisent finalement des resets. Les resets sont uniquement intéressants lors d'applications très poussées où le style par défaut des navigateurs n'est pas du tout pertinent. Mais attention, ceci peut être dangereux car il est plus compliqué de retrouver le style par défaut d'un navigateur que de le supprimer. D'où l'intérêt du normalize.

Je vous indique tout de même les plus connus :

- [Le reset d'Eric Meyer](http://meyerweb.com/eric/tools/css/reset/)
- [Le normalize de Necolas](http://necolas.github.io/normalize.css/)

### Stratégie de fichiers

Allez, on continue, stratégie de fichiers, où est ce qu'on range tout ce beau monde, comment on s'y retrouve.

On en a discuté un peu, certains préfèrent mettre leurs fichiers dans directement dans le _root_ du projet, moi je préfère le mettre dans un dossier `/src` afin de bien différencier source, sortie, et fichiers de configuration du projet. Ce qui donne ceci :

```
.
├── README.md
├── bin // executables
├── dist // fichiers finaux
├── src // votre application
│   ├── assets // fichiers statiques (pas de compilation)
│   ├── collections
│   ├── events
│   ├── glyphicons // svg qui seront transformés en font
│   ├── images
│   ├── lib
│   ├── models
│   ├── styles
│   │   ├── base
│   │   ├── shared
│   │   ├── views
│   │   ├── import.css
│   │   └── shame.css // hack css où il est obligatoire de commenter pourquoi
│   ├── routers
│   ├── templates
│   └── views
│   ├── app.js
│   ├── bootstrap.js
|   └── import.json
├── gulpfile.js
├── Makefile
├── package.json
```

### OOCSS, BEM, SMACSS, whatever else

Haaaaaaa, grand débat ici. Quelle est la meilleure façon, la meileure manière de maintenir du CSS, de nommer ses classes, d'avoir des conventions de nommage.

Tout d'abord, on s'est tous accordés sur un point : OOCSS, SMACSS, le reste, ça ne marche pas. Ca marche pas parce que ça casse dans certains cas la sémantique, dans d'autres cas, ça revient à faire du style inline mais avec des noms de classes style `.left` pour un `float: left`. On a tous plus ou moins essayé et ça devient vite le bordel. On s'est aussi accordés, mais ça c'est évident, qu'avoir une convention de nommage est primordiale pour maintenir correctement du style (ou autre d'ailleurs).
Et surtout il n'est plus nécessaire d'utiliser les IDs. Les IDs doivent servir uniquement dans le cas de la combinaison label/input, mais sinon ils empêchent toute généralisation d'un block.

Il est clair qu'après des années d'intégration, le constat est là, la cascade, ce n'est vraiment pas l'idéal. Cela reste toujours aussi difficile de faire du css generique et/ou maintenable, et c'est justement en quoi BEM permet de résoudre à la fois les problématiques de cascade mais aussi de nommage.

Il y a de nombreux articles sur BEM, sur ses conventions (oui il peut y avoir plusieurs conventions de nommage, BEM reste plus une méthologie).

En quelques termes, BEM redéfinit la cascade en ne plus l'utilisant comme par exemple : `.header .title.is-active` mais `.header__title--is-active`, BEM venant de Block, Element, Modifier. C'est exactement ce que je viens de découper en une seule classe plutôt que 3.

Pour ma part, j'utilise la convention de nommage qui se rapproche très fortément du framework JavaScript "Montage.js" : `.org-(js-)-MyBlock-myElement--myModifier`.

Je ne souhaite volontairement pas m'étendre sur le sujet car je vous invite à lire [mon article à ce sujet](/posts/css/petite-definition-bem/).

Je vous laisse tout de même deux articles à ce sujet qui présentent plutôt bien le principe (ils sont en anglais).

- [A New Front-End Methodology: BEM](http://www.smashingmagazine.com/2012/04/16/a-new-front-end-methodology-bem/)
- [An Introduction to the BEM Methodology](http://webdesign.tutsplus.com/articles/an-introduction-to-the-bem-methodology--cms-19403)


### Sémantique

On est tous d'accord, faire de la sémantique oui, quand cela ne va pas à l'encontre de la maintenabilité et de la réutilisation de code.

Pour ma part, trop de fois je me suis pris la tête sur la sémantique au point de faire des classes uniques qui ont du sens mais qui `@extend` (voir pré-processeurs) une classe générique.


### Accessibilité

Pour être franc, l'accessibilité a un coût en terme de temps qui n'est jamais négligeable et rentre souvent en conflit avec l'UX d'une personne sans handicap.

Typiquement, imaginons que nous avons un formulaire bancaire, comment faire un boucle uniquement sur ce formulaire (pratique dans le cas d'une personne sans handicap) tout en ne contraignant la navigation "classique" ?

Le constat est là aussi, nous sommes tous ici sensibilisés par l'accessibilité, nous essayons d'en faire le plus possible (souvent sur notre temps libre ou entre deux tâches) mais personne n'administre du temps à cela.

Une éventuelle solution a émmergé durant les discussions : pourquoi ne pourrait-on pas connaître d'emblée la situation de l'utilisateur lorsqu'il arrive sur le site ?

Un navigateur dédié à certains handicaps devrait être détectable d'entée de jeu et que l'on puisse nous développeurs faire en conséquence dans ce cas là.

C'est exactement comme l'histoire de résolution / bande passante. Le w3c nous propose à l'heure actuelle de détecter la résolution pour faire en conséquence sur notre site, or, ce n'est pas du tout le pivot intéressant, c'est surtout la bande passante qui nous permet d'ajuster notre site web.

Bref, comme souvent, le W3C est à la rue, n'avance pas comme le web avance (vite, très vite) et les outils nous font défaut à l'heure actuelle pour répondre à certains besoins.

### Les pièges de l'intégration (e.g. display: inline-block)

Pour inline-block par exemple, il n'y a malheureusement pas le choix de soit coller les balises, soit minifier le html (ou la partie ayant des inline-block), soit de mettre des commentaires.

Les layouts seront toujours aussi pénibles tant que les flexbox ne sont pas supportés par la majorité des navigateurs du marché. Les 3 solutions principales pour le moment : float, inline-block, table(-cell).

En ce qui concerne le box-sizing, il sauve beaucoup d'intégration. Il faut juste voir le support des navigateurs que vous supportez. 
Oh et attention, tous les navigateurs ne font pas 16px de base. Je dis ça si vous utilisez les `(r)em` (qui sont expliqués juste après).

Enfin, `<input type="number">` est tout buggé sous Firefox. Par exemple, mettre min="1900" sur cet input et que vous cliquez sur le "+", vous commencerez à "1" et non "1900"... Je sens que je vais devoir encore faire un ticket. :')

### Unités px, rem, em, pt, %

Pour être clair, personne n'utilise des `pt`, les `px`, faut les oublier de plus en plus, et `rem` est sûrement le plus simple et le mieux mais dépend malheureusement de vos supports navigateurs où dans quels cas il faut souvent se rabattre sur les `em`. Le pourcentage est forcément préconisé.

### CSS Frameworks ? lesquels ? pourquoi ? quand ?

[Foundation](http://foundation.zurb.com/), [Bootstrap](http://getbootstrap.com/), [pure](http://purecss.io/) sont les plus connus (et peut-être les pires). Il ne vous serviront uniquement que dans le cas d'une [PoC](http://fr.wikipedia.org/wiki/Preuve_de_concept) ou une administration de site (_back-office_).

Par contre, [topcoat](http://topcoat.io/) peut se révéler assez intéressant de par sa haute personnalisation et de son _BEM-way_. Eventuellement [inuit.css](http://inuitcss.com/) sinon.


### Bonus

Lors de cas de contenus affichés via de l'ajax, pensez de plus en plus à faire du "prerender", c'est à dire que pendant que le contenu se charge, au lieu de mettre des _spinners_, _loaders_, _toussa_, essayez de mettre des visuels qui ressembleront à l'élément final. C'est ce que fait par exemple facebook, et c'est pas mal du tout. Tenez :

<img src="data:image/jpg;base64,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bwUv1pT7Au3gpfrSn2BdvBS/WlPsC7eCl+tKfYHhvCev1yt+0RGTJqlrxR8SP/ej5tHo06C/19M3/8QAHhEAAgMAAwEBAQAAAAAAAAAAAAECERIDMTJAECD/2gAIAQIBAT8AlJo3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3I3Ii20cnYuvx9FFFFFDXzQ8nJ2Lr8fRTMsyxqvoh5OTs0aG7+yHk5OymUymUymUymUymUymUymUymUymUymUymUymUymU/5h5OTstlstlstlstlstlstlstlstlstlstlstlstlstlv+YeTk7NM0zTNM0zTNM0zTNM0zTNM0zTNM0zTNM0zTNM0zTNM0zTG2/wBh5OTstFotFotFotFotFotD+OHk5O/vh5OTv74eTk7++Hk5O/vh5OTv74eTk7++Hk5O/vh5OTv74eTk7++Hk5O/vh5OTv74eTk7++HklGzDMMwzDMMwzDMMwzDMMwzDMMwzDMMwzDMMwzDMMwzDMMwzDMMwyKpH//EAB0RAAMBAQEBAQEBAAAAAAAAAAABEhExAkAQICH/2gAIAQMBAT8AS0lEolEolEolEolEolEolEolEolEolEolEolEolEolEolEofTzwffzz000000T35n088H3889NRSKQnv0Pp54NayRLPsfTzw1Go1Go1Go1Go1Go1Go1Go1Go1Go1Go1Go1Go1Gr+X088MRiMRiMRiMRiMRiMRiMRiMRiMRiMRiMRiMRiMRi/l9PPBrSUSiUSiUSiUSiUSiUSiUSiUSiUSiUSiUSiUSiUShLP19PPDGYzGYzGYzGYzGYzGL43088+99PPPvfTzz73088+99PPPvfTzz73088+99PPPvfTzz73088+99PPPvfTzz730Twoooooooooooooooooooooooooooooof8ArP/Z
">



Voilà pour cette table ronde, j'espère que le compte rendu vous a plu. Il est évident que c'est sûrement plus intéressant en direct, on essayera peut-être par la suite de faire du streaming (live) ou du podcast, à voir.

N'hésitez pas à continuer le débat dans les commentaires.

Pour ma part, j'ai déjà d'autres articles "dans le pipe" (comme disent certains marketeux). Je vous retrouve bientôt ici ou sur Twitter, kiss.
