import mkdirp from "mkdirp";
import fs from "fs";
import NodePath from "path";

export const saveCachePath = (str: string) => resolvePath("../.cache", str);

export const resolvePath = (...p: string[]) =>
  NodePath.resolve(__dirname, ...p);

export const saveFilePath = (path: string) => {
  const _path = path.replace(/[^\/]*$/, "");
  if (!fs.existsSync(_path)) {
    mkdirp.sync(_path);
  }
  return path;
};
