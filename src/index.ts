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
) {
  const { normalizer = normalizeURLPaths, transformer = expressTransformer } =
    options || {};

  const normalizedURLs = normalizer(basePath, paths);
  const transformedURLS = normalizedURLs.map((x) => transformer(x));
  return transformedURLS;
}

export function expressTransformer(
  x: Pick<URLPathInfo, "url"> & Record<string, unknown>
) {
  const regx = pathToRegexp(x.url);
  x.url = x.url.replace(/([\/]\${1,2}(\w+))/g, "/:$2");
  x.match = regx;
  x.matchFlags = regx.flags;
  return x;
}

export function normalizeURLPaths(
  basePath: string,
  paths: FilePathInfo[] = []
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
    .sort(sortUrls);
}

// a variation of the following snippet
// https://github.com/cyco130/smf/blob/c4b601f48cd3b3b71bea6d76b52b9a85800813e4/smf/shared.ts#L22
// this doesn't consider partial routes segments
// eg: /about/$foo-$bar isn't a valid route segment for this sorter
function sortUrls(x, y) {
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

export function stringify(manifest: URLPathInfo | URLPathInfo[]) {
  let stringified = JSON.stringify(
    manifest,
    (k, v) => {
      if (v instanceof RegExp) {
        return v.source;
      }
      return v;
    },
    2
  );

  return stringified;
}
