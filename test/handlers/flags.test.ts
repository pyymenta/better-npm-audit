import sinon from 'sinon';
import { expect } from 'chai';
import * as semver from 'semver';
import { CommandOptions } from '../../src/types';
import handleInput from '../../src/handlers/handleInput';
import { getNpmVersion } from '../../src/utils/npm';

describe('Flags', () => {
  describe('default', () => {
    it('should be able to handle default correctly', async () => {
      const callbackStub = sinon.stub();
      const options = {};

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);

      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--exclude', () => {
    it('should be able to pass exception IDs using the command flag smoothly', async () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds = ['1567', '919'];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      // with space
      options.exclude = '1567, 1902';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, ['1567', '1902'])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 1902')).to.equal(true);

      // string ID
      options.exclude = '1134,GWE-1234,888';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, ['1134', 'GWE-1234', '888'])).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1134, GWE-1234, 888')).to.equal(true);

      consoleStub.restore();
    });

    it('should info log the vulnerabilities if it is only passed in command line', async () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = { exclude: '1567,919' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds = ['1567', '919'];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.called).to.equal(true);
      expect(consoleStub.calledWith('Exception IDs: 1567, 919')).to.equal(true);

      consoleStub.restore();
    });

    it('should not info log the vulnerabilities if there are no exceptions given', async () => {
      const callbackStub = sinon.stub();
      const consoleStub = sinon.stub(console, 'info');
      const options = {};
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);

      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      expect(consoleStub.called).to.equal(false);

      consoleStub.restore();
    });
  });

  describe('--production', () => {
    it('should be able to set production mode from the command flag correctly', async () => {
      const callbackStub = sinon.stub();
      const options = { production: true };
      const npmVersion = getNpmVersion();
      const flag = semver.satisfies(npmVersion, '<=8.13.2') ? '--production' : '--omit=dev';
      const auditCommand = `npm audit ${flag}`;
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--registry', () => {
    it('should be able to set registry from the command flag correctly', async () => {
      const callbackStub = sinon.stub();
      const options: CommandOptions = { registry: 'https://registry.npmjs.org/' };
      const auditCommand = 'npm audit --registry=https://registry.npmjs.org/';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
    });
  });

  describe('--level', () => {
    it('should be able to pass audit level from the command flag correctly', async () => {
      const callbackStub = sinon.stub();
      let options: CommandOptions = { level: 'info' };

      const auditCommand = 'npm audit';
      const exceptionIds: string[] = [];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, 'info', exceptionIds)).to.equal(true);

      options = { level: 'low' };
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low', exceptionIds)).to.equal(true);

      options = { level: 'moderate' };
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate', exceptionIds)).to.equal(true);

      options = { level: 'high' };
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high', exceptionIds)).to.equal(true);

      options = { level: 'critical' };
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical', exceptionIds)).to.equal(true);
    });

    it('should be able to pass audit level from the environment variables correctly', async () => {
      const callbackStub = sinon.stub();
      const options = {};
      const auditCommand = 'npm audit';

      // info
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'info';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'info')).to.equal(true);

      // low
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'low';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'low')).to.equal(true);

      // moderate
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'moderate';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'moderate')).to.equal(true);

      // high
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'high';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'high')).to.equal(true);

      // critical
      process.env.NPM_CONFIG_AUDIT_LEVEL = 'critical';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, 'critical')).to.equal(true);

      // Clean up
      delete process.env.NPM_CONFIG_AUDIT_LEVEL;
    });
  });

  describe('--module-ignore', () => {
    it('should be able to pass module names using the command flag smoothly', async () => {
      const callbackStub = sinon.stub();
      const options = { moduleIgnore: 'lodash,moment' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      const modulesToIgnore = ['lodash', 'moment'];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // with space
      options.moduleIgnore = 'lodash, moment';

      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // invalid exceptions
      options.moduleIgnore = 'lodash,undefined,moment';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);

      // invalid null
      options.moduleIgnore = 'lodash,null,moment';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore)).to.equal(true);
    });
  });

  describe('--include-columns', () => {
    it('should be able to pass column names using the command flag smoothly', async () => {
      const callbackStub = sinon.stub();
      const options = { includeColumns: 'ID,Module' };
      const auditCommand = 'npm audit';
      const auditLevel = 'info';
      const exceptionIds: string[] = [];
      const modulesToIgnore: string[] = [''];
      const columnsToInclude = ['ID', 'Module'];

      expect(callbackStub.called).to.equal(false);
      await handleInput(options, callbackStub);
      expect(callbackStub.called).to.equal(true);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // with space
      options.includeColumns = 'ID, Module';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // invalid exceptions
      options.includeColumns = 'ID,undefined,Module';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);

      // invalid null
      options.includeColumns = 'ID,null,Module';
      await handleInput(options, callbackStub);
      expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds, modulesToIgnore, columnsToInclude)).to.equal(true);
    });
  });

  describe('--configFile', () => {
    describe('requestNsprcFile', () => {
      it.skip('should be able to handle default correctly', async () => {
        const callbackStub = sinon.stub();
        const options = {
          configFile: 'test/__mocks__/configFile.ts',
        };

        expect(callbackStub.called).to.equal(false);
        await handleInput(options, callbackStub);
        expect(callbackStub.called).to.equal(true);

        const auditCommand = 'npm audit';
        const auditLevel = 'info';
        const exceptionIds: string[] = [];
        expect(callbackStub.calledWith(auditCommand, auditLevel, exceptionIds)).to.equal(true);
      });
    });
  });
});
