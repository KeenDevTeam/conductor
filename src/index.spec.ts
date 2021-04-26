/**
 * My module test(s)
 */

import MyModule, { myFunc } from './index';

import { expect } from 'chai';


describe('MyModule tests', () => {

  it('should have a class named MyClass', () => {
    expect(MyModule).to.be.a('function');
    expect(MyModule.name).to.be.eq('MyModule');
  });

  it('should export myFunc', () => {
    expect(myFunc).to.be.a('function');
    expect(myFunc.name).to.be.eq('myFunc');
  });
});
