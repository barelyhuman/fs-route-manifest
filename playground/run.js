import {
  readDirectory,
  normalizeURLPaths,
  writeManifest,
} from "../src/index.js";

const filePaths = readDirectory("./routes");
const urlManifest = normalizeURLPaths("/routes", filePaths);

console.log({ urlManifest });

writeManifest(urlManifest, "./routes.js");
