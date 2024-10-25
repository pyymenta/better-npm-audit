import { NsprcFile } from '../../src/types/nsprc';
import NSPRC from '../__mocks__/nsprc.json';

/**
 * Function to declare the requestNsprcFile
 * @return {Promise<NsprcFile | boolean>} Nsp config strategy
 */
async function requestNsprcFile(): Promise<NsprcFile | boolean> {
  return NSPRC;
}

export default {
  requestNsprcFile,
};
