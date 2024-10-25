import { NsprcFile, ReadNsprcStrategy } from 'src/types';
import { readFile } from './file';
import { ConfigFile } from 'src/types/configFile';

/**
 * Strategy to get nsp config from nsprc file
 * @param  {String} filePath File path
 * @return {NsprcFile} The npm version
 */
export function fromNsprcFile(filePath: string): NsprcFile | boolean {
  return readFile(filePath);
}

/**
 * Strategy to get nsp config from config requestNsprcFile function
 * @param  {String} filePath File path
 * @return {NsprcFile} The npm version
 */
export async function fromConfigFile(filePath: string): Promise<NsprcFile | boolean> {
  const configFileModule = (await import(`${process.cwd()}/${filePath}`)) as ConfigFile;

  if (typeof configFileModule.requestNsprcFile === 'function') {
    return await configFileModule.requestNsprcFile();
  } else {
    return false;
  }
}

/**
 * Returns strategy from context
 * @param  {ReadNsprcStrategy} strategy File path
 * @param  {String} filePath File path
 * @return {ReadNsprcStrategy} Nsp config strategy
 */
export async function nsprcReaderContext(strategy: ReadNsprcStrategy, filePath: string): Promise<NsprcFile | boolean> {
  return await strategy(filePath);
}

/**
 * Get nsp Reader
 * @param  {String} filePath File path
 * @return {ReadNsprcStrategy} Reader strategy
 */
export function nsprcReader(filePath: string): ReadNsprcStrategy {
  const ext = filePath.split('.').pop();

  if (ext === 'nsprc') {
    return fromNsprcFile;
  } else if (ext === 'js' || ext === 'ts') {
    return fromConfigFile;
  } else {
    throw new Error('Unsupported file type');
  }
}
