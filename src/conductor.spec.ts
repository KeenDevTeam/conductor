/**
 * Conductor test
 */

import Conductor from './conductor';

import { expect } from 'chai';

describe('PuzzleIO:Conductor', () => {

  describe('Creation', () => {

    it('Should be a constructor', () => {
      expect(Conductor).to.be.a('function');
    });

    it('should have a create method', () => {
      expect(Conductor).to.have.property('create').that.is.a('function');
    });

    it('should create a new instance using factory method', () => {
      const instance = Conductor.create();
      expect(instance).to.be.instanceOf(Conductor);
    });

    it('should create a new instance using constructor', () => {
      const instance = new Conductor();
      expect(instance).to.be.instanceOf(Conductor);
    });
  });

  describe('Functionality', () => {

    let instance: Conductor | undefined = undefined;

    beforeEach(() => {
      instance = Conductor.create();
    });

    it('should add 1 sync handler of the conductor', async () => {

      instance!.add(n => n * 2);

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(1);
      const result = await instance!.run<number>(2);
      expect(result).to.be.a('number').that.is.eq(4);
    });

    it('should add 2 sync handlers of the conductor', async () => {

      instance!.add((m, n) => m * n);
      instance!.add(n => n + 1);

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(2);
      const result = await instance!.run<number>(1, 2);
      expect(result).to.be.a('number').that.is.eq(3);
    });

    it('should add 3 sync handlers of the conductor', async () => {

      instance!.add(() => [1, 2]);
      instance!.add(([m, n]) => m * n);
      instance!.add(n => n + 1);

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(3);
      const result = await instance!.run<number>();
      expect(result).to.be.a('number').that.is.eq(3);
    });

    it('should add sync if block', async () => {

      instance!.if(
        // check whether it's an even number
        {
          check: (n) => n % 2 === 0,
          handler: (n) => `${n} is even`
        },
        // otherwise it's an odd number
        {
          check: (n) => n % 2 > 0,
          handler: (n) => `${n} is odd`
        },
        // otherwise, invalid number
        {
          handler: (n) => `${n} is not a valid number`
        }
      );

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(1);

      const oddResult = await instance!.run<number>(1);
      expect(oddResult).to.be.a('string').that.is.eq('1 is odd');

      const evenResult = await instance!.run<number>(2);
      expect(evenResult).to.be.a('string').that.is.eq('2 is even');
    });
  });
});
