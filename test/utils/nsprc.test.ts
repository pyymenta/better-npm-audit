import { expect } from 'chai';
import sinon from 'sinon';
import { fromNsprcFile, fromConfigFile, nsprcReaderContext, nsprcReader } from '../../src/utils/nsprc';
import nsprc from '../__mocks__/nsprc.json';
import * as fileUtils from '../../src/utils/file';
import path from 'path';

describe('Nsprc Reader Module', () => {
  let originalImport: any;

  beforeEach(() => {
    // Backup the original global import function
    originalImport = (global as any).import;
  });

  afterEach(() => {
    // Restore the original global import function
    (global as any).import = originalImport;
    sinon.restore();
  });

  describe('fromNsprcFile', () => {
    it('should return the file content when readFile returns data', () => {
      const mockFileContent = { version: '1.0.0' };
      sinon.stub(fileUtils, 'readFile').returns(mockFileContent);

      const result = fromNsprcFile('path/to/.nsprc');
      expect(result).to.deep.equal(mockFileContent);
    });

    it('should return false if readFile fails', () => {
      sinon.stub(fileUtils, 'readFile').returns(false);

      const result = fromNsprcFile('path/to/.nsprc');
      expect(result).to.equal(false);
    });
  });

  describe.skip('fromConfigFile', () => {
    it('should call requestNsprcFile and return its result when requestNsprcFile exists', async () => {
      const mockConfigFile = { requestNsprcFile: sinon.stub().resolves(nsprc) };
      const importStub = sinon.stub().resolves(mockConfigFile);
      sinon.stub(process, 'cwd').returns(path.resolve(__dirname));

      (global as any).import = importStub;
      const result = await fromConfigFile('test/__mocks__/configFile.ts');
      console.log({
        result,
        nsprc,
        calledOnce: mockConfigFile.requestNsprcFile.calledOnce,
      });

      expect(mockConfigFile.requestNsprcFile.calledOnce).to.be.true;
    });

    it('should return false if requestNsprcFile is not a function', async () => {
      const mockConfigFile = { notRequestNsprcFile: true };
      const importStub = sinon.stub().resolves(mockConfigFile);
      sinon.stub(process, 'cwd').returns(path.resolve(__dirname));

      (global as any).import = importStub;
      const result = await fromConfigFile('test/__mocks__/configFile.ts');
      expect(result).to.equal(false);
    });
  });

  describe('nsprcReaderContext', () => {
    it('should call the strategy function with the file path', async () => {
      const mockStrategy = sinon.stub().resolves({ version: '1.0.0' });
      const result = await nsprcReaderContext(mockStrategy, 'path/to/.nsprc');
      expect(result).to.deep.equal({ version: '1.0.0' });
      expect(mockStrategy.calledWith('path/to/.nsprc')).to.be.true;
    });
  });

  describe('nsprcReader', () => {
    it('should return fromNsprcFile when the file extension is .nsprc', () => {
      const result = nsprcReader('path/to/.nsprc');
      expect(result).to.equal(fromNsprcFile);
    });

    it('should return fromConfigFile when the file extension is .js', () => {
      const result = nsprcReader('test/__mocks__/configFile.ts');
      expect(result).to.equal(fromConfigFile);
    });

    it('should return fromConfigFile when the file extension is .ts', () => {
      const result = nsprcReader('path/to/config.ts');
      expect(result).to.equal(fromConfigFile);
    });

    it('should throw an error for unsupported file types', () => {
      expect(() => nsprcReader('path/to/config.txt')).to.throw('Unsupported file type');
    });
  });
});
