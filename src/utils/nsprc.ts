import { NsprcFile, ReadNsprcStrategy } from "src/types";
import { readFile } from "./file";
import { ConfigFile } from "src/types/configFile";

export function fromNsprcFile(filePath: string): NsprcFile | boolean {
  return readFile(filePath);
}

export async function fromConfigFile(filePath: string): Promise<NsprcFile | boolean> {
  const configFileModule = (await import(`${process.cwd()}/${filePath}`)) as ConfigFile;

  if (typeof configFileModule.requestNsprcFile === 'function') {
    return await configFileModule.requestNsprcFile();
  } else {
    return false;
  }
}

export async function nsprcReaderContext(strategy: ReadNsprcStrategy, filePath: string) {
  return await strategy(filePath);
}

export function nsprcReader(filePath: string): Function {
  const ext = filePath.split('.').pop();

  if (ext === 'nsprc') {
    return fromNsprcFile;
  } else if (ext === 'js' || ext === 'ts') {
    return fromConfigFile;
  } else {
    throw new Error('Unsupported file type');
  }
}
