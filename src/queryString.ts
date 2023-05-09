import type { Globals } from "./useGlobals";

import * as options from "./options";

export const substituteQuery = (
  features: Globals,
  currentMediaText: string
) => {
  let feature: keyof Globals;
  for (feature in features) {
    const value = features[feature];

    // only transform conditions when a feature is defined and detected
    if (value !== undefined && currentMediaText.includes(feature)) {
      // replace boolean uses of the feature
      for (const alternate of options.features[feature]) {
        if (value === alternate) {
          currentMediaText = currentMediaText.replace(
            `(${feature}: ${alternate})`,
            "all"
          );
        } else {
          currentMediaText = currentMediaText.replace(
            `(${feature}: ${alternate})`,
            "not all"
          );
        }
      }

      // replace boolean uses of the feature
      currentMediaText = currentMediaText.replace(
        `(${feature})`,
        value === "no-preference" ? "not all" : "all"
      );
    }
  }

  return currentMediaText;
};
