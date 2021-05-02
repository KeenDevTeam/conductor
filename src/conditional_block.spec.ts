/**
 * If tests
 */

import { expect } from 'chai';
import ConditionalBlock from './conditional_block';
import { runFactory, defaultInvalidHandlerDetectors, ensureHandlerIsValidFactory } from './execution_engine';

describe('PuzzleIO:Conductor:ConditionalBlock', () => {

  let conditionalBlockRunner: any = undefined;

  beforeEach(() => {

    conditionalBlockRunner = ConditionalBlock(
      runFactory(
        ensureHandlerIsValidFactory(...defaultInvalidHandlerDetectors)
      )
    );
  });

  describe('success', () => {

    it('should return the initial parameter when no condition is matched', async () => {

      const result1 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        }
      )(1);

      expect(result1).to.be.an('array').that.has.lengthOf(1);
      expect(result1[0]).to.be.a('number').that.is.eq(1);
    });

    it('should call the conditional block', async () => {

      const result1 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        }
      )(2);

      expect(result1).to.be.an('number').that.is.eq(4);
    });

    it('should call the default block if criteria did not meet', async () => {

      const result1 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        },
        {
          handler: (n: number) => n * 3
        }
      )(1);

      expect(result1).to.be.a('number').that.is.eq(3);
    });

    it('should call every block that its criteria meet', async () => {

      const result1 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        },
        {
          check: (n: number) => n % 3 === 0,
          handler: (n: number) => n * 3
        },
        {
          handler: (n: number) => n * 4
        }
      )(2);

      expect(result1).to.be.a('number').that.is.eq(4);

      const result2 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        },
        {
          check: (n: number) => n % 3 === 0,
          handler: (n: number) => n * 3
        },
        {
          handler: (n: number) => n * 4
        }
      )(3);

      expect(result2).to.be.a('number').that.is.eq(9);

      const result3 = await conditionalBlockRunner!(
        {
          check: (n: number) => n % 2 === 0,
          handler: (n: number) => n * 2
        },
        {
          check: (n: number) => n % 3 === 0,
          handler: (n: number) => n * 3
        },
        {
          handler: (n: number) => n * 4
        }
      )(5);

      expect(result3).to.be.a('number').that.is.eq(20);
    });
  });
});
