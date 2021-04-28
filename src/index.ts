/**
 * Library entrypoint
 */

import debug from 'debug';

/**
 * Data Types
 */
export type SyncFunction = <U>(...args: Array<any>) => U;
export type AsyncFunction = <U>(...args: Array<any>) => Promise<U>;
export type Handler = SyncFunction | AsyncFunction | Conductor;
/**************************/

/**
 * The heart of the conductor module
 */
export default class Conductor {

  /**************************/
  /* Static method(s)       */
  /**************************/
  /**
   * Create a new instance of the Conductor class
   * @returns New instance of the Conductor class
   */
  static create(): Conductor { return new Conductor(); }
  /**************************/

  constructor();
  constructor(...children: Array<Handler>) {

    this.debugger('Creating a new instance of Conductor...');

    // create a new instance of the conductor
    const conductor = Conductor.create();

    // children added directly
    if (Array.isArray(children)) {
      this.debugger(`Adding total number of ${children.length} handlers to the newly created conductor...`);
      conductor.children.push(...children);
    }

    // conductor is ready
    return conductor;
  }

  /**************************/
  /* Properties             */
  /**************************/

  /**
   * List of nodes to be executed
   */
  protected readonly children: Array<Handler> = [];

  /**
   * Debugger
   */
  private readonly debugger = debug('PuzzleIO:conductor');
  /**************************/

  /**************************/
  /* Helper method(s)       */
  /**************************/

  /**
   * Ensure that a handler is valid
   * @param handler Handler to test against validator(s)
   */
  protected ensureHandlerIsValid(handler?: Handler): void {
    if (typeof handler === 'undefined' || handler === null || typeof handler !== typeof Conductor || typeof handler !== 'function') {
      this.debugger('Invalid handler is passed.');
      throw new Error('The provided handler is not acceptable as a valid handler. Handler must be either a function or an instance of Conductor.');
    }
  }

  /**
   * Run the requested handler using provided arguments
   * @param target Target handler to call
   * @param args List of argument to be passed
   * @returns Promise of the U
   */
  protected async runHandler<U>(target: Handler, ...args: any): Promise<U> {

    this.debugger('Running handler...');

    // placeholder for the handler
    let fn: Handler | undefined = undefined;

    // either sync or async function
    if (typeof target === 'function') {
      this.debugger('Handler is a sync function.');
      fn = target;
    }

    // conductor.run method
    if (target instanceof Conductor) {
      this.debugger('Handler is an instance of conductor.');
      fn = (target as Conductor).run;
    }

    // make sure that the handler was found
    this.ensureHandlerIsValid(fn);
    this.debugger('Handler is valid.');

    // try calling the handler
    let result: U | Promise<U> | undefined = undefined;

    this.debugger('Executing target function...');
    // call handler(p1,p2,p3,...)
    if (Array.isArray(args) === true) {
      this.debugger(`Total number of ${args.length} are gonna passed to the function...`);
      result = fn!(...args) as any;
    }
    else {
      // call handler()
      this.debugger('Passing no argument to the function...');
      result = fn!() as any;
    }

    // sync function was called?
    if (result instanceof Promise === false) {
      this.debugger('Converting sync result to promise...');
      result = Promise.resolve(result) as Promise<U>;
    }

    // wait for the result
    this.debugger('Resolving async function...');
    return (await result)!;
  }

  /**
   * Add conditional handler
   * @param condition Conditional block
   * @returns Modified instance of the conductor
   */
  protected addConditionalHandler(condition: { check?: Handler, handler: Handler }): Conductor {

    /**
     * Conditional wrapper
    */
    const conditionalWrapper = async (...args: Array<any>): Promise<any> => {

      // like default or else block, this code always gets executed
      if (typeof condition.check === 'undefined') { return await this.runHandler(condition.handler, ...args); }

      // execute conditional block
      const result = await this.runHandler(condition.check, ...args);

      // run the handler block
      if (result === true) { return await this.runHandler(condition.handler, ...args); }
    };

    // add newly created conditional wrapper to the list of conductor items
    return this.add(conditionalWrapper);
  }
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

    this.debugger('Adding handler...');
    this.debugger('Ensure that the handler is valid...');

    // ensure the first handler is valid
    this.ensureHandlerIsValid(handler);

    // add handler to the list of child handlers
    this.debugger('Adding handler to the list of handlers...');
    this.children.push(handler!);

    // any other handler?
    if (Array.isArray(otherHandlers) && otherHandlers.length > 0) {

      this.debugger(`Adding total number of ${otherHandlers.length} handlers to the list...`);

      // iterate over other handlers, validate and add them to the list of children handlers
      this.children.push(
        ...otherHandlers.map(h => {
          // ensure the handler is valid
          this.ensureHandlerIsValid(h);
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
  public switch(
    ...cases: Array<{ check?: Handler; handler: Handler }>
  ): Conductor {

    this.debugger(`Adding switch with total number of ${cases.length} case(s)...`);
    if (!Array.isArray(cases) || cases.length < 1) {
      throw new Error('No case is provided to the switch.');
    }

    // iterate over cases, convert them to conditional handler
    cases.forEach(this.addConditionalHandler);

    return this;
  }

  /**
   * Add if block
   * @param blocks List of if blocks
   * @returns Modified conductor
   */
  public if(
    ...blocks: Array<{ check?: Handler, handler: Handler }>
  ): Conductor {

    this.debugger(`Adding if statement with total number of ${blocks.length} blocks(s)...`);
    if (!Array.isArray(blocks) || blocks.length < 1) {
      throw new Error('No block is provided to the if statement.');
    }

    // iterate over cases, convert them to conditional handler
    blocks.forEach(this.addConditionalHandler);

    return this;
  }

  /**
   * Run the current flow and return the result
   * @param args List of the arguments to be passed to the first node in the chain
   */
  async run<U>(...args: Array<any>): Promise<U> {
    this.debugger('Running conductor...');
    return await (this.children as Array<any>).reduce(
      // iterate over the handlers in the children list
      async (memo: Array<any> | any, handler: Handler) => await this.runHandler(handler, ...memo),
      args
    );
  }
}
