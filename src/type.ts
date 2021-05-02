/**
 * Data types
 */

export type SyncFunction = (...args: Array<any>) => any;
export type AsyncFunction = (...args: Array<any>) => Promise<any>;

export interface Runnable {

  /**
   * Run the list of handlers
   * @param args List of arguments to be passed to the entry point
   */
  run<U>(...args: Array<any>): Promise<U | undefined>;
}

export type Handler = SyncFunction | AsyncFunction | Runnable;

export type HandlerValidator = (handler?: Handler) => boolean;
