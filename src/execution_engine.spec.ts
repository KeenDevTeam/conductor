/**
 * Conductor module test(s)
 */

import { expect } from 'chai';

import { Handler } from './type';

import {
  defaultInvalidHandlerDetectors,
  ensureHandlerIsValidFactory,
  runFactory,
} from './execution_engine';


describe('PuzzleIO:ExecutionEngine', () => {

  describe('ensureHandlerIsValid', () => {

    let ensureHandlerIsValid: ((handler?: any) => void) | undefined = undefined;

    beforeEach(
      () => {
        ensureHandlerIsValid = ensureHandlerIsValidFactory(...defaultInvalidHandlerDetectors);
      }
    );

    describe('failures', () => {

      const invalidHandlerErrorMessage = 'The provided handler is not acceptable as a valid handler. Handler must be either a function or an instance of object that implements Runnable.';

      it('should throw exception if handler is undefined', () => {
        expect(() => ensureHandlerIsValid!()).throws(invalidHandlerErrorMessage);
        expect(() => ensureHandlerIsValid!(undefined)).throws(invalidHandlerErrorMessage);
      });

      it('should throw exception if handler is null', () => {
        expect(() => ensureHandlerIsValid!(null)).throws(invalidHandlerErrorMessage);
      });

      it('should throw exception if handler is not a RunnableConductor', () => {
        expect(() => ensureHandlerIsValid!(
          {
            run2: () => 1
          }
        )).throws(invalidHandlerErrorMessage);
      });
    });

    describe('success', () => {

      it('should not throw exception for a sync function', () => {
        ensureHandlerIsValid!(() => 1);
      });

      it('should not throw exception for an async function', () => {
        ensureHandlerIsValid!(async () => 1);
      });

      it('should not throw exception if handler is a sync RunnableConductor', () => {
        ensureHandlerIsValid!(
          {
            run: () => 1
          }
        );
      });

      it('should not throw exception if handler is an async RunnableConductor', () => {
        ensureHandlerIsValid!(
          {
            run: async () => 1
          }
        );
      });
    });
  });

  describe('run', () => {

    // create a new instance of runner
    let runner: (<U>(handler: Handler, ...args: Array<any>) => Promise<U | undefined>) | undefined = undefined;

    beforeEach(() => {
      runner = runFactory(ensureHandlerIsValidFactory(...defaultInvalidHandlerDetectors));
    });

    it('should be able to pass no parameter', async () => {
      const result = await runner!(() => 1);
      expect(result).to.be.a('number').that.is.eq(1);
    });

    it('should be able to pass 1 parameter', async () => {
      const result = await runner!((n) => n + 1, 1);
      expect(result).to.be.a('number').that.is.eq(2);
    });

    it('should be able to pass more than 1 parameters', async () => {
      const result = await runner!((...n) => n.reduce((acc, n) => acc + n, 0), 1, 2, 3);
      expect(result).to.be.a('number').that.is.eq(6);
    });

    it('should run an async function', async () => {

      const result = await runner!(async (n) => n * 2, 1);
      expect(result).to.be.a('number').that.is.eq(2);
    });

    it('should run a sync runnable object', async () => {

      const result = await runner!(
        {
          run: (...args) => {
            return args.reduce!((sum, n) => sum + n, 0)
          }
        },
        2, 3
      );
      expect(result).to.be.a('number').that.is.eq(5);
    });

    it('should run an async runnable object', async () => {

      const result = await runner!(
        {
          run: async (...args) => {
            return args.reduce!((sum, n) => sum + n, 0)
          }
        },
        3, 4, 5
      );
      expect(result).to.be.a('number').that.is.eq(12);
    });
  });
});
