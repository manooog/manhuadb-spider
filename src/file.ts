import mkdirp from "mkdirp";
import fs from "fs";
import NodePath from "path";
import { exec } from "child_process";
import { isDev } from ".";
import { loggy } from "./loggy";

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

export const execInChildProcess = (command: string) => {
  return new Promise(resolve => {
    exec(command, (err, stdout, stderr) => {
      if (err !== null) loggy(stderr, { type: "error", always: true });
      resolve(err === null ? true : false);
    });
  });
};
