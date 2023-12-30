# fs-route-manifest

Simple manifest generation utilities for file system routing

## Basic Usage

```sh
; npm i @barelyhuman/fs-route-manifest
```

```js
import { generateRoutes, readDirectory, stringify } from "../src/index.ts";

// Read the routes directory and give all
// file paths
const filePaths = readDirectory("./routes");

// Generate a manifest or hashmap of information from the file path data from above
const urlManifest = generateRoutes("/routes", filePaths);

// stringify this data, so you can store it on the filesystem for caching and work avoidance
console.log(stringify(urlManifest));
```

## API Reference

[TypeAPI &rarr;](https://typeapi.barelyhuman.dev/pkg/@barelyhuman/fs-route-manifest)
