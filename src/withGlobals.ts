import type { DecoratorFunction } from "@storybook/addons";
import type {
  AnyFramework,
  PartialStoryFn,
  StoryContext,
} from "@storybook/csf";
import { PARAM_KEY } from "./constants";
import { processCSS } from "./processCSS";
import { useEffect, useGlobals as useAddonGlobals } from "@storybook/addons";
import { Globals, useGlobals } from "./useGlobals";
import { substituteQuery } from "./queryString";

// Set up patching early enough
const originalMatchMedia = globalThis.matchMedia;
let queryLists: MediaQueryList[] = [];
globalThis.matchMedia = (query) => {
  const queryList = originalMatchMedia(query);
  queryLists.push(queryList);
  return queryList;
};

const updateMatchMediaQueries = (globals: Globals) => {
  for (const queryList of queryLists) {
    const newQueryList = originalMatchMedia(
      substituteQuery(globals, queryList.media)
    );
    Object.defineProperty(queryList, "matches", {
      value: newQueryList.matches,
      writable: true,
    });
    queryList.dispatchEvent(
      new MediaQueryListEvent("change", {
        media: queryList.media,
        matches: queryList.matches,
      })
    );
  }
};

export const withGlobals: DecoratorFunction<void> = (
  storyFn: PartialStoryFn<AnyFramework>,
  context: StoryContext<AnyFramework>
) => {
  const [globals, updateGlobals] = useGlobals(useAddonGlobals);

  // apply user parameter overrides
  const overrides = Object.assign({}, context.parameters[PARAM_KEY]) as Globals;
  let feature: keyof Globals;
  for (feature in overrides) {
    if (globals[feature] === undefined && overrides[feature] !== undefined) {
      updateGlobals(overrides);
      break;
    }
  }

  // transform css
  useEffect(() => {
    processCSS(document.styleSheets, globals);
  }, Object.values(globals));

  // update matchMedia queries
  useEffect(() => {
    updateMatchMediaQueries(globals);
  }, Object.values(globals));
  // run on new matchMedia queries
  useEffect(() => {
    const originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = (query) => {
      const queryList = originalMatchMedia(query);
      updateMatchMediaQueries(globals);
      return queryList;
    };
    return () => {
      globalThis.matchMedia = originalMatchMedia;
    };
  }, [globals]);
  // clean up matchMedia queries on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      queryLists = [];
    };
  }, [storyFn]);

  return storyFn();
};
