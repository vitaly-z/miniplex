---
title: Installation
---

# Installation

> **Warning** Since this is the documentation for the upcoming 2.0 version of Miniplex, we will be using the `next` tag for installation. If you'd rather use the stable release of the library, [please refer to the 1.0 documentation](https://github.com/hmans/miniplex/tree/miniplex%401.0.0).

Add the `miniplex` package to your project using your favorite package manager:

```bash
npm add miniplex@next
yarn add miniplex@next
pnpm add miniplex@next
```

You can now import the `World` class from this package and use it to create a Miniplex ECS world:

```js
import { World } from "miniplex"

const world = new World()
```