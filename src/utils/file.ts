import fs from 'fs';
import path from 'path';
import { NsprcFile } from 'src/types';
import { isJsonString } from './common';

/**
 * Read file from path
 * @param  {String} path          File path
 * @return {(Object | Boolean)}   Returns the parsed data if found, or else returns `false`
 */
export function readFile(path: string): NsprcFile | boolean {
  try {
    const data = fs.readFileSync(path, 'utf8');
    if (!isJsonString(data)) {
      return false;
    }
    return JSON.parse(data);
  } catch (err) {
    return false;
  }
}

/**
 * Finds the root directory of the project by locating the nearest `package.json` file
 * starting from the provided directory or the current working directory.
 *
 * @param {string} [currentDir=process.cwd()] - The starting directory to search for the project root.
 * @return {string} The absolute path of the project root directory.
 * @throws Will throw an error if no `package.json` file is found up the directory tree.
 */
export function getProjectRoot(currentDir: string = process.cwd()): string {
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error('Project root not found');
    }
    currentDir = parentDir;
  }
  return currentDir;
}
