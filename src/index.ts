import fs from "node:fs";
import path, { extname, join, resolve } from "node:path";
import { pathToRegexp } from "path-to-regexp";

export type FilePathInfo = {
  name: string;
  relativePath: any;
  absolutePath: any;
  isDirectory: any;
};

export type URLPathInfo = FilePathInfo & {
  url: string;
  match?: string;
  matchFlags?: string;
};

export type GenerateOptions = {
  normalizer: typeof normalizeURLPaths;
  transformer: typeof expressTransformer;
  sorter: typeof defaultURLSorter;
};

export const defaultFS = {
  readDir: fs.readdirSync,
};

export function readDirectory(basePath: string, fsInterface = defaultFS) {
  return fsInterface
    .readDir(basePath)
    .map((file) => addFileInformation(basePath, file))
    .reduce((acc, item) => {
      if (item.isDirectory) {
        return acc.concat(readDirectory(join(basePath, item.name)));
      }
      return acc.concat(item);
    }, []);
}

function addFileInformation(basePath: string, file: string): FilePathInfo {
  const absPath = resolve(basePath, file);
  return {
    name: file,
    relativePath: join(basePath, file),
    absolutePath: absPath,
    isDirectory: fs.statSync(absPath).isDirectory() || false,
  };
}

export function generateRoutes(
  basePath,
  paths: FilePathInfo[],
  options?: GenerateOptions
): URLPathInfo[] {
  const {
    normalizer = normalizeURLPaths,
    transformer = expressTransformer,
    sorter = defaultURLSorter,
  } = options || {};

  const normalizedURLs = normalizer(basePath, paths, sorter);
  const transformedURLS = normalizedURLs.map((x) => transformer(x));
  return transformedURLS;
}

/**
 * Default transformer used by generateRoutes in conjunction with the `normalizeURLPaths` normalizer
 * to add matching regex to the final manifest.
 * If you've changed the normalizer, make sure you also change the transformer or validate everything
 * you wish for the transformer to handler
 *
 * The current transformer generates a similar regexp pattern to express.js
 */
export function expressTransformer(
  x: Pick<URLPathInfo, "url"> & Record<string, unknown>
): URLPathInfo {
  const regx = pathToRegexp(x.url);
  x.url = x.url.replace(/([\/]\${1,2}(\w+))/g, "/:$2");
  x.match = regx;
  x.matchFlags = regx.flags;
  return x as URLPathInfo;
}

/**
 * Normalizer used by the generateRoutes function to find and clean up the file paths
 * to valid url segments that can be parsed/compiled to create regex matchers for the final manifest
 * This particular normalizer does the following
 * - Clean File Paths and creates basic urls
 * - Sorts the urls based on the required priority
 */
export function normalizeURLPaths(
  basePath: string,
  paths: FilePathInfo[] = [],
  sorter = defaultURLSorter
): URLPathInfo[] {
  const normalizedBasePath = basePath.replace(/^\./, "").replace(/^\//, "");
  const pathRegex = new RegExp(`^[\/]?(${normalizedBasePath})`);
  return paths
    .map((x) => {
      let url = x.relativePath
        .replace(pathRegex, "")
        .replace(/\.(js|ts)x?$/, "")
        .replace(/index$/, "")
        .replace(/(\w+)\/$/, "$1");

      return {
        ...x,
        url: url,
      };
    })
    .sort(sorter);
}

// a variation of the following snippet
// https://github.com/cyco130/smf/blob/c4b601f48cd3b3b71bea6d76b52b9a85800813e4/smf/shared.ts#L22
// this doesn't consider partial routes segments
// eg: /about/$foo-$bar isn't a valid route segment for this sorter
export function defaultURLSorter(x: URLPathInfo, y: URLPathInfo) {
  const catchAll =
    Number(x.url.match(/\$\$(\w+)$/)) - Number(y.url.match(/\$\$(\w+)$/));
  if (catchAll) return catchAll;

  const aSegments = x.url.split("/");
  const bSegments = y.url.split("/");

  const dynamicSegments =
    aSegments.filter((segment) => segment.startsWith("$")).length -
    bSegments.filter((segment) => segment.startsWith("$")).length;
  if (dynamicSegments) return dynamicSegments;

  const segments = aSegments.length - bSegments.length;
  if (segments) return segments;

  for (let i = 0; i < aSegments.length; i++) {
    const aSegment = aSegments[i];
    const bSegment = bSegments[i];
    const dynamic =
      Number(aSegment.startsWith("$")) - Number(bSegment.startsWith("$"));
    if (dynamic) return dynamic;
  }

  return 0;
}

/**
 * Stringify a given manifest with an optional replacer functions
 * the default replacer changes the `match` regex to a string representation of the regex
 */
export function stringify(
  manifest: URLPathInfo | URLPathInfo[],
  replacer = defaultReplacer
) {
  let stringified = JSON.stringify(
    manifest,

    replacer,
    2
  );

  return stringified;
}

/**
 * Default replacer used by the `stringify` function to decide what string to be returned in the stringified manifest.
 * As the stringification is on an object, the normal JSON.stringify rules still apply
 */
export function defaultReplacer(k: string, v: unknown) {
  if (v instanceof RegExp) {
    return v.source;
  }
  return v;
}
