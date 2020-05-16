# Deno and Node.js sharing module code

`TLDR;` use [.mjs](#mjs-for-the-rescue);

## Intro

In this repo I documented my short adventure to get some code / modules shared between [Deno](https://deno.land/) and [Node.js](https://nodejs.org/).

First of all, I am really happy to find out that Deno - new generation server side JavaScript / TypeScript runtime finally reached version 1.0!

I really like Node.js and I use it for some small personal and work related projects since [v 0.10.xx](https://nodejs.org/en/download/releases/), which is quite a lot in web years.

In addition to that I really enjoy coding with [TypeScript](https://www.typescriptlang.org/) and use it pretty heavily since Angular v2.0.

During my experiments I was looking for some easy setup to start writing TypeScript with Node.js, but unfortunately nothing satisfied me, so Deno looked like an ideal tool to try next, so we are here.

## Adventure

During first weekend after [Deno v 1.0 official release](https://deno.land/v1), I decided to play a bit with it. After quicly reading [Deno manual](https://deno.land/manual/introduction) and skimming through several introductory articles and tutorials:

- [Deno 1.0: What you need to know](https://blog.logrocket.com/deno-1-0-what-you-need-to-know/)
- [The Deno Handbook: A TypeScript Runtime Tutorial with Code Examples](https://www.freecodecamp.org/news/the-deno-handbook/)
- [The Deno Handbook: a concise introduction to Deno 🦕](https://flaviocopes.com/deno/)

I checked few intro [examples](https://deno.land/std/examples) in official repo, [ordered Deno 1.0 hoodie](https://deno.land/v1/hoodie) and successfully submitted my first [PR to Deno](https://github.com/denoland/deno/pull/5467) (:D). 

Now I was fully prepared to give Deno a try in the reald world code and rewrite a tiny isolated part of my toy Node.js project.

The code part I was going to rewrite is responsible for generating some (text) files according to config. File system part was not very challenging, as Deno provides standard [FS](https://deno.land/std/fs) API's quite similar to ones we have in Node.js.

More interesting part was to make sure my existing Node.js app continues to work together with Deno. So I had to find a way to share configuration JavaScript files between Deno and Node.js.

Bellow is simplified and isolated version of code I had initially.

### Initial code

I have a simple Node.js module which exports some config (initial/config.js):

```js
const myConfig = {
  key: "value",
};

module.exports = { myConfig };
```

I consume it inside another module (initial/consumer.js):

```js
const { myConfig } = require("./config");

console.log("myConfig: ", myConfig);
```

All is fine and works as expected:

```bash
$ node initial/consumer.js
myConfig:  { key: 'value' }
```

### And here a wild Deno appears 🦕

To make things more interesting let's add Deno to the setup and make sure it is able to consume the same config as the Node.js part of application.

Note that Node.js supports [CommonJS](https://en.wikipedia.org/wiki/CommonJS) style modules by default which are consumed by using `require();` function and Deno supports ES Modules which are consumed by using `import from '';` statement.

### .mjs for the rescue!

My (not ideal, IMO) solution was to use [.mjs](https://nodejs.org/api/esm.html) module for shared code (shared/config.mjs):

```mjs
const myConfig = {
  key: "value",
};

export { myConfig };
```

Consume it from Deno (almost) in usual way (note, that we import using '.mjs' file extension). shared/consumer.ts:

```ts
import { myConfig } from "./config.mjs";

console.log("myConfig: ", myConfig);
```

And we had to modify Node.js version a bit:

- Use `import()` function instead of `require()`.
- Make function async.

shared/consumer.js:

```js
(async () => {
  const { myConfig } = await import("./config.mjs");

  console.log("myConfig: ", myConfig);
})();
```

And it works:

```bash
$ deno run shared/consumer.ts
myConfig:  { key: "value" }

$ node shared/consumer.js
myConfig:  { key: 'value' }
```

## Why it is not so great?

1. I had to modify existing shared code and consumer code;
2. I had to use intermediate file format (`.mjs`);
3. My Node.js code became async, which adds another layer of complexity;

## What's awesome about it?

1. It works and helps me to avoid code duplication;
2. I was able to learn few new things!

## Resources

- https://deno.land/manual
- https://nodejs.org/api/esm.html
- https://medium.com/@giltayar/native-es-modules-in-nodejs-status-and-future-directions-part-i-ee5ea3001f71

Note that code was tested using Node.js `v14.0.0` and `Deno 1.0.0`.
