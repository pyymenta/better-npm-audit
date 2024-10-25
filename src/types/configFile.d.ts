import { NsprcFile } from '../../src/types/nsprc';

export interface ConfigFile {
  requestNsprcFile?: () => Promise<NsprcFile | boolean>;
}
