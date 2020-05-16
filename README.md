# Deno and Node.js Sharing module code

## Intro

In this repo I will document my adventures by trying to share some code / modules between [Deno](https://deno.land/) and [Node.js](https://nodejs.org/).

First of all, I really happy to find out that Deno - new generation server side JavaScript / TypeScript runtime finally reached version 1.0!

I really like Node.js and use it for some small personal and work related projects since [v 0.10.xx](https://nodejs.org/en/download/releases/), which is quite a lot in web years.

And I really enjoy coding with [TypeScript](https://www.typescriptlang.org/) and use it since Angular v2.0.

## Adventure

During first weekend after Deno v 1.0 official release, I decided to play a bit with it. After reading throw [Deno manual](https://deno.land/manual/introduction) and checking few introductory articles:

- [Deno 1.0: What you need to know](https://blog.logrocket.com/deno-1-0-what-you-need-to-know/)
- [The Deno Handbook: A TypeScript Runtime Tutorial with Code Examples](https://www.freecodecamp.org/news/the-deno-handbook/)
- [The Deno Handbook: a concise introduction to Deno 🦕](https://flaviocopes.com/deno/)

And checking few intro [examples](https://deno.land/std/examples) in official repo I decided to give it a try and rewrite a tiny isolated part of my toy Node.js project using Deno. 

The code part I was going to rewrite is responsible for generating some files according to config. File system part was not very challenging, as Deno provides standard [FS](https://deno.land/std/fs) API's quite similar Node.js.

## A bit more interesting part

More interesting part was to make sure my existing app continues to work together with Deno. So I had to find a way to share configuration files between Deno and Node.js.

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

To make things more interesting let's add Deno to the setup and decide to be able to consume the same config from Node.js and Deno.

Note that Node.js by default supports CommonJS style modules which are consumed by using `require();` function and Deno supports ES Modules which are consumed by using `import from '';` statement.

### .mjs for the rescue!

My (not ideal, IMO) solution was to use [.mjs](https://nodejs.org/api/esm.html) module for shared code.(shared/config.mjs):

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
- Use async import instead of require.
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

