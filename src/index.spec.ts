/**
 * Conductor module test(s)
 */

import Conductor from './index';

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

    let instance = Conductor.create();

    beforeEach(() => {
      instance = Conductor.create();
    });

    it('should add 1 sync handler of the conductor', async () => {

      instance!.add(n => n * 2);

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(1);
      const result = await instance.run<number>(2);
      expect(result).to.be.a('number').that.is.eq(4);
    });

    it('should add 2 sync handlers of the conductor', async () => {

      instance!.add(() => [1, 2]);
      instance!.add(([m, n]) => m * n);
      instance!.add(n => n + 1);

      expect(instance as any).to.have.property('children').that.is.an('array').has.lengthOf(3);
      const result = await instance.run<number>();
      expect(result).to.be.a('number').that.is.eq(3);
    });
  });
});
