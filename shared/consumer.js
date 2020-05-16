(async () => {
  const { myConfig } = await import("./config.mjs");

  console.log("myConfig: ", myConfig);
})();
