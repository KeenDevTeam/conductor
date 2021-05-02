/**
 * Conditional block
 */

import Debug, { Debugger } from 'debug';

import { Handler, ConditionalHandler, DefaultConditionalHandler } from './type';

const ConditionalFactory = (
  (debug: Debugger) =>
    (runner: (handler: Handler, ...args: Array<any>) => any) =>
      (
        mainBlock: ConditionalHandler,
        ...otherBlocks: Array<ConditionalHandler | DefaultConditionalHandler>
      ): (...args: Array<any>) => Promise<any> => {

        debug(`Creating conditional handler with ${1 + otherBlocks.length} conditional blocks...`);

        // return the handler
        return async (...args: Array<any>): Promise<any> => {

          debug('Running conditional handler...');

          // run the main block check function
          let matched = await runner(mainBlock.check, ...args);
          debug(`Main block Matched: ${matched}`);

          // run the main block if check function was satisfied
          let output: any = matched ? await runner(mainBlock.handler, ...args) : args;

          let counter = 0;

          // check other remaining blocks
          while (matched === false && counter < otherBlocks.length) {

            debug(`Running conditional block #${counter + 1} ...`);

            // get the current block and increase the counter
            const otherBlock = otherBlocks[counter++];

            // check to see whether current block is the default one
            const isDefaultBlock = typeof otherBlock.check === 'undefined' || otherBlock.check === null;
            debug(`Is default block: ${isDefaultBlock}`);

            // run the condition
            matched = isDefaultBlock ? true : await runner(otherBlock.check!, ...args);
            output = matched ? await runner(otherBlock.handler, ...args) : args;

            debug(`Matched: ${matched}`);
          }

          debug('Execution of conditional block is done.');

          return output;
        }
      }
)(Debug('PuzzleIO:Conductor:ConditionalHandler'))

export default ConditionalFactory;
