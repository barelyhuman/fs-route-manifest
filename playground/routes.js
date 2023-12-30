export default [
  {
    url: "/",
    file: {
      name: "index.js",
      relativePath: "routes/index.js",
      absolutePath:
        "/Users/sid/lab/filesystem-router/playground/routes/index.js",
      isDirectory: false,
    },
    match: "^\\/[\\/#\\?]?$",
    matchFlags: "i",
  },
  {
    url: "/nested",
    file: {
      name: "index.js",
      relativePath: "routes/nested/index.js",
      absolutePath:
        "/Users/sid/lab/filesystem-router/playground/routes/nested/index.js",
      isDirectory: false,
    },
    match: "^\\/nested[\\/#\\?]?$",
    matchFlags: "i",
  },
  {
    url: "/:id",
    file: {
      name: "index.js",
      relativePath: "routes/$id/index.js",
      absolutePath:
        "/Users/sid/lab/filesystem-router/playground/routes/$id/index.js",
      isDirectory: false,
    },
    match: "^\\/\\$id[\\/#\\?]?$",
    matchFlags: "i",
  },
  {
    url: "/nested/:param",
    file: {
      name: "$param.ts",
      relativePath: "routes/nested/$param.ts",
      absolutePath:
        "/Users/sid/lab/filesystem-router/playground/routes/nested/$param.ts",
      isDirectory: false,
    },
    match: "^\\/nested\\/\\$param[\\/#\\?]?$",
    matchFlags: "i",
  },
  {
    url: "/:id/another",
    file: {
      name: "another.js",
      relativePath: "routes/$id/another.js",
      absolutePath:
        "/Users/sid/lab/filesystem-router/playground/routes/$id/another.js",
      isDirectory: false,
    },
    match: "^\\/\\$id\\/another[\\/#\\?]?$",
    matchFlags: "i",
  },
];
