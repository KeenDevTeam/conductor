/**
 * Conductor test
 */

import { expect } from 'chai';

import Conductor from './conductor';
import ConditionalBlock from './conditional_block';
import { runFactory, ensureHandlerIsValidFactory, defaultInvalidHandlerDetectors } from './execution_engine';

describe('PuzzleIO:Conductor', () => {
  let handlerValidator: any | undefined = undefined;
  let runner: any | undefined = undefined;
  let conditionalBlockFactory: any | undefined = undefined;

  beforeEach(() => {
    handlerValidator = ensureHandlerIsValidFactory(...defaultInvalidHandlerDetectors);
    runner = runFactory(handlerValidator);
    conditionalBlockFactory = ConditionalBlock(runner);
  });

  describe('Creation', () => {
    it('Should be a constructor', () => {
      expect(Conductor).to.be.a('function');
    });

    it('should have a create method', () => {
      expect(Conductor).to.have.property('create').that.is.a('function');
    });

    describe('failure', () => {
      it('should throw error if options is undefined', () => {
        expect(() => new Conductor()).throw('options must be an object.');
        expect(Conductor.create).throw('options must be an object.');
      });

      it('should throw error if options.handler is undefined', () => {
        expect(() => new Conductor({ validateHandler: undefined })).throw('options.validateHandler must be a function.');
        expect(() => Conductor.create({ validateHandler: undefined })).throw('options.validateHandler must be a function.');
      });

      it('should throw error if options.run is undefined', () => {
        expect(() => new Conductor({ validateHandler: handlerValidator, run: undefined })).throw('options.run must be a function.');
        expect(() => Conductor.create({ validateHandler: handlerValidator, run: undefined })).throw('options.run must be a function.');
      });

      it('should throw error if options.conditionalBlockFactory is undefined', () => {
        expect(() => new Conductor({ validateHandler: handlerValidator, run: runFactory(handlerValidator) })).throw(
          'options.conditionalBlockFactory must be a function.'
        );
        expect(() => Conductor.create({ validateHandler: handlerValidator, run: runFactory(handlerValidator) })).throw(
          'options.conditionalBlockFactory must be a function.'
        );
      });
    });

    describe('success', () => {
      it('should create a new instance using factory method', () => {
        const instance = Conductor.create({
          validateHandler: handlerValidator,
          conditionalBlockFactory: conditionalBlockFactory,
          run: runner,
        });
        expect(instance).to.be.instanceOf(Conductor);
      });

      it('should create a new instance using constructor', () => {
        const instance = new Conductor({
          validateHandler: handlerValidator,
          conditionalBlockFactory: conditionalBlockFactory,
          run: runner,
        });
        expect(instance).to.be.instanceOf(Conductor);
      });
    });
  });

  describe('Functionality', () => {
    let instance: Conductor | undefined = undefined;

    beforeEach(() => {
      instance = new Conductor({ validateHandler: handlerValidator, conditionalBlockFactory: conditionalBlockFactory, run: runner });
    });

    it('should add 1 sync handler to the conductor', async () => {
      instance!.add(n => n * 2);

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(1);
      const result = await instance!.run<number>(2);
      expect(result).to.be.a('number').that.is.eq(4);
    });

    it('should add 2 sync handlers to the conductor', async () => {
      instance!.add((m, n) => m * n);
      instance!.add(n => n + 1);

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(2);
      const result = await instance!.run<number>(1, 2);
      expect(result).to.be.a('number').that.is.eq(3);
    });

    it('should add 3 sync handlers to the conductor', async () => {
      instance!.add(() => [1, 2]);
      instance!.add(([m, n]) => m * n);
      instance!.add(n => n + 1);

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(3);
      const result = await instance!.run<number>();
      expect(result).to.be.a('number').that.is.eq(3);
    });

    it('should add handlers at once to the conductor', async () => {
      instance!.add(
        (m, n) => m * n,
        n => n + 1
      );

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(2);
      const result = await instance!.run<number>(1, 2);
      expect(result).to.be.a('number').that.is.eq(3);
    });

    it('should add sync if block', async () => {
      instance!.if(
        // check whether it's an even number
        {
          check: n => n % 2 === 0,
          handler: n => `${n} is even`,
        },
        // otherwise it's an odd number
        {
          check: n => n % 2 > 0,
          handler: n => `${n} is odd`,
        },
        // otherwise, invalid number
        {
          handler: n => `${n} is not a valid number`,
        }
      );

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(1);

      const oddResult = await instance!.run<number>(1);
      expect(oddResult).to.be.a('string').that.is.eq('1 is odd');

      const evenResult = await instance!.run<number>(2);
      expect(evenResult).to.be.a('string').that.is.eq('2 is even');
    });

    it('should add sync switch block', async () => {
      instance!.switch(
        // check whether it's an even number
        {
          check: n => n % 2 === 0,
          handler: n => `${n} is even`,
        },
        // otherwise it's an odd number
        {
          check: n => n % 2 > 0,
          handler: n => `${n} is odd`,
        },
        // otherwise, invalid number
        {
          handler: n => `${n} is not a valid number`,
        }
      );

      expect(instance as any)
        .to.have.property('handlers')
        .that.is.an('array')
        .has.lengthOf(1);

      const oddResult = await instance!.run<number>(1);
      expect(oddResult).to.be.a('string').that.is.eq('1 is odd');

      const evenResult = await instance!.run<number>(2);
      expect(evenResult).to.be.a('string').that.is.eq('2 is even');
    });
  });
});
