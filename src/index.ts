// @ts-expect-error
if (typeof module === "object" && module.hot && module.hot.decline) {
  // @ts-expect-error
  module.hot.decline();
}

export default {};
