import {
  generateRoutes,
  readDirectory,
  stringify
} from "../src/index.ts";

const filePaths = readDirectory("./routes");
const urlManifest = generateRoutes("/routes", filePaths);

console.log(stringify(urlManifest))
