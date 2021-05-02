/**
 * Execution engine
 */

import { Runnable, HandlerValidator, Handler } from './type';

import Debug, { Debugger } from 'debug';

/**
 * Check whether handler is an instance of Runnable by applying duck-typing check
 * @param handler Handler to be checked
 * @returns Flag that determines the result
 */
const isInstanceOfRunnable: HandlerValidator = (handler?: Handler) => (
  handler !== null
  &&
  typeof handler === 'object'
  &&
  typeof handler.run === 'function'
);

/**
 * Check whether handler is a function (either sync or async)
 * @param handler Handler to be checked
 * @returns Flag that determines the result
 */
const isHandlerIsFunction: HandlerValidator = (handler?: Handler) => typeof handler === 'function';

/**
 * List of invalid handler detector functions
 */
export const invalidHandlerDetectors: ReadonlyArray<HandlerValidator> = [
  (handler?: any) => typeof handler === 'undefined',
  (handler?: any) => handler === null,
  (handler?: any) =>
    isHandlerIsFunction(handler) === false
    &&
    isInstanceOfRunnable(handler) === false
];

/**
 * Ensure that a handler is valid
 * @param handler Handler to test against validator(s)
 */
export const ensureHandlerIsValidFactory = (
  (debug: Debugger) =>
    (...validators: ReadonlyArray<HandlerValidator>) =>
      (handler?: any): void =>
        validators.forEach(
          validator => {
            if (validator(handler) === true) {
              debug('Invalid handler is passed.');
              throw new Error('The provided handler is not acceptable as a valid handler. Handler must be either a function or an instance of object that implements Runnable.');
            }
          }
        )
)(Debug('PuzzleIO:Conductor:ExecutionEngine.ensureHandlerIsValid'));

/**
 * Run a specific handler
 * @param handler Handler to run
 * @param args List of argument to be passed to the handler
 */
export const runFactory = (
  (
    debug: Debugger,
    ifHandlerIsFunction: typeof isHandlerIsFunction,
    ifHandlerIsRunnable: typeof isInstanceOfRunnable,
  ) => (
    handlerValidator: (handler?: any) => void,
    ) => async <U>(handler: Handler, ...args: Array<any>): Promise<U | undefined> => {
      debug('Running handler...');

      // make sure that the handler was found
      handlerValidator(handler);
      debug('Handler is valid.');

      // placeholder for the handler
      let fn: Handler | undefined = undefined;

      // either sync or async function
      if (ifHandlerIsFunction(handler) === true) {
        debug('Handler is a function.');
        fn = handler;
      }

      // Runnable.run method
      if (ifHandlerIsRunnable(fn) === true) {
        debug('Handler is an instance of conductor.');
        fn = (handler as Runnable).run;
      }

      // try calling the handler
      let result: U | Promise<U> | undefined = undefined;

      debug('Executing target function...');
      debug(`Total number of ${args.length} is/are going to be passed the function...`);
      result = (fn as any)(...args) as any;
      // // call handler(p1,p2,p3,...)
      // if (args.length > 0) {

      // }
      // else {
      //   // call handler()
      //   debug('Passing no argument to the function...');
      //   result = fn!() as any;
      // }

      // sync function was called?
      if (result instanceof Promise === false) {
        debug('Converting sync result to promise...');
        return Promise.resolve(result);
      }

      // wait for the result
      debug('Resolving the promise...');
      return await (result as Promise<U>);
    })(
      Debug('PuzzleIO:Conductor:ExecutionEngine.run'),
      isHandlerIsFunction,
      isInstanceOfRunnable
    );
