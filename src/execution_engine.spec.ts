/**
 * Conductor module test(s)
 */

import { expect } from 'chai';

import { invalidHandlerDetectors, ensureHandlerIsValidFactory } from './execution_engine';

describe('PuzzleIO:ExecutionEngine', () => {

  describe('ensureHandlerIsValid', () => {

    const ensureHandlerIsValid = ensureHandlerIsValidFactory(...invalidHandlerDetectors);

    describe('failures', () => {

      const invalidHandlerErrorMessage = 'The provided handler is not acceptable as a valid handler. Handler must be either a function or an instance of object that implements Runnable.';

      it('should throw exception if handler is undefined', () => {
        expect(() => ensureHandlerIsValid()).throws(invalidHandlerErrorMessage);
        expect(() => ensureHandlerIsValid(undefined)).throws(invalidHandlerErrorMessage);
      });

      it('should throw exception if handler is null', () => {
        expect(() => ensureHandlerIsValid(null)).throws(invalidHandlerErrorMessage);
      });

      it('should throw exception if handler is not a RunnableConductor', () => {
        expect(() => ensureHandlerIsValid(
          {
            run2: () => 1
          }
        )).throws(invalidHandlerErrorMessage);
      });
    });

    describe('success', () => {

      it('should not throw exception for a sync function', () => {
        ensureHandlerIsValid(() => 1);
      });

      it('should not throw exception for an async function', () => {
        ensureHandlerIsValid(async () => 1);
      });

      it('should not throw exception if handler is a sync RunnableConductor', () => {
        ensureHandlerIsValid(
          {
            run: () => 1
          }
        );
      });

      it('should not throw exception if handler is an async RunnableConductor', () => {
        ensureHandlerIsValid(
          {
            run: async () => 1
          }
        );
      });
    });
  });

  describe('run', () => {

  });
});
