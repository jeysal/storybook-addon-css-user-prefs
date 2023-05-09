import { substituteQuery } from "./queryString";
import type { Globals } from "./useGlobals";

/** Recursively process CSS and transform media queries based on feature flags. */
export function processCSS(
  containers: ArrayLike<CSSContainer>,
  features: Globals
) {
  for (const target of containers as CSSContainer[]) {
    if (target instanceof CSSMediaRule) {
      /** Initial value, regardless of present transformations. */
      let initialMediaText = getMediaText(target);

      let currentMediaText = substituteQuery(features, initialMediaText);

      // update the media text if the value has changed
      if (currentMediaText !== target.media.mediaText) {
        target.media.mediaText = currentMediaText;
      }
    } else if ("cssRules" in target) {
      processCSS(target.cssRules, features);
    }
  }
}

/** Returns the initial text of a Media Rule, regardless of transformations. */
const getMediaText = (target: CSSMediaRule) => {
  let conditionText = conditionTextMap.get(target);

  if (conditionText) return conditionText;

  conditionTextMap.set(target, (conditionText = target.media.mediaText));

  return conditionText;
};

/** WeakMap used to store initial text of Media Rules. */
const conditionTextMap = new WeakMap<CSSRule, string>();

export type CSSContainer = CSSStyleSheet | CSSMediaRule | CSSRule;
