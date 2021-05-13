/**
 * Conductor
 */

import Debug from 'debug';

import { Handler, Runnable, EnsureHandlerIsValid, ConditionalHandler, DefaultConditionalHandler } from './type';

import { defaultInvalidHandlerDetectors, ensureHandlerIsValidFactory, runFactory } from './execution_engine';
import conditionalBlockFactory from './conditional_block';

export type ConductorOptions = {
  validateHandler?: EnsureHandlerIsValid;
  run?: ReturnType<typeof runFactory>;
  conditionalBlockFactory?: ReturnType<typeof conditionalBlockFactory>;
};

/**
 * The heart of the conductor module
 */
export default class Conductor implements Runnable {
  /**************************/
  /* Static method(s)       */
  /**************************/
  /**
   * Create a new instance of the Conductor class
   * @returns New instance of the Conductor class
   */
  static create(options?: ConductorOptions, ...handlers: Array<Handler>): Conductor {
    return new Conductor(options, ...handlers);
  }

  static createDefault(...handlers: Array<Handler>): Conductor {

    // create default reuqirements
    const validateHandler = ensureHandlerIsValidFactory(...defaultInvalidHandlerDetectors);
    const run = runFactory(validateHandler);

    // create new instance of the Conductor class
    return new Conductor({
      validateHandler,
      run,
      conditionalBlockFactory: conditionalBlockFactory(run)
    }, ...handlers);
  }
  /**************************/

  constructor(options?: ConductorOptions, ...handlers: Array<Handler>) {
    this.debug('Creating a new instance of Conductor...');

    if (typeof options === 'undefined' || typeof options !== 'object') {
      throw new Error('options must be an object.');
    }

    if (typeof options.validateHandler !== 'function') {
      throw new Error('options.validateHandler must be a function.');
    }

    if (typeof options.run !== 'function') {
      throw new Error('options.run must be a function.');
    }

    if (typeof options.conditionalBlockFactory !== 'function') {
      throw new Error('options.conditionalBlockFactory must be a function.');
    }

    this.options = options;

    this.debug(`Adding total number of ${handlers.length} handlers to the newly created conductor...`);
    this.handlers.push(...handlers);
  }

  /**************************/
  /* Properties             */
  /**************************/

  protected readonly options: ConductorOptions;

  /**
   * List of handlers
   */
  protected readonly handlers: Array<Handler> = [];

  /**
   * Debugger
   */
  private readonly debug = Debug('PuzzleIO:Conductor');
  /**************************/

  /**************************/
  /* Public method(s)       */
  /**************************/

  /**
   * Add one or more functions to the list of handlers
   * @param handlers List of function/handlers to be executed (either sync or async)
   * @returns Current instance of the conductor
   */
  public add(handler?: Handler, ...otherHandlers: Array<Handler>): Conductor {
    this.debug('Adding handler...');
    this.debug('Ensure that the handler is valid...');

    // ensure the first handler is valid
    this.options.validateHandler!(handler);

    // add handler to the list of child handlers
    this.debug('Adding handler to the list of handlers...');
    this.handlers.push(handler!);

    // any other handler?
    if (otherHandlers.length > 0) {
      this.debug(`Adding total number of ${otherHandlers.length} handlers to the list...`);

      // iterate over other handlers, validate and add them to the list of children handlers
      this.handlers.push(
        ...otherHandlers.map(h => {
          // ensure the handler is valid
          this.options.validateHandler!(h);
          return h;
        })
      );
    }

    return this;
  }

  /**
   * Add switch case
   * @param cases List of cases
   * @returns Modified conductor
   */
  public switch(mainCase: ConditionalHandler, ...otherCases: Array<DefaultConditionalHandler>): Conductor {
    this.debug(`Adding switch with total number of ${otherCases.length + 1} case(s)...`);

    // iterate over cases, convert them to a single conditional handler
    this.handlers.push(this.options.conditionalBlockFactory!(mainCase, ...otherCases));

    return this;
  }

  /**
   * Add if block
   * @param blocks List of if blocks
   * @returns Modified conductor
   */
  public if(mainBlock: ConditionalHandler, ...otherBlocks: Array<DefaultConditionalHandler>): Conductor {
    this.debug(`Adding if statement with total number of ${otherBlocks.length + 1} blocks(s)...`);

    // iterate over cases, convert them to a single conditional handler
    this.handlers.push(this.options.conditionalBlockFactory!(mainBlock, ...otherBlocks));

    return this;
  }

  /**
   * Run the current flow and return the result
   * @param args List of the arguments to be passed to the first node in the chain
   */
  async run<U>(...args: Array<any>): Promise<U | undefined> {
    this.debug('Running conductor...');

    // result placeholder
    let result: any = args;
    let counter = 0;

    while (counter < this.handlers.length) {
      this.debug(`Running handler #${counter + 1} ...`);

      const isFirstHandler = counter === 0;
      const handler = this.handlers[counter++];

      if (isFirstHandler === true) {
        // in the first iteration, all the parameters will be passed
        // using spread operator to handle unlimited number of parameters
        result = await this.options.run!(handler, ...result);
      } else {
        // for the rest of the iterations, result of the previous function
        // will be passed as a single item (functions returns 1 sinle item)
        result = await this.options.run!(handler, result);
      }
    }

    this.debug('Operation is finished.');

    return result;
  }
}
