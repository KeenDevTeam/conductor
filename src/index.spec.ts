import { expect } from 'chai';

import * as mdl from './index';

describe('index', () => {
  const validProperties = ['ConditionalBlock', 'Conductor', 'executionEngine'];
  it('should contains all the exported members', () => {
    Object.keys(mdl).forEach((exportedMember: string) => expect(validProperties.indexOf(exportedMember)).to.be.greaterThan(-1));
  });
});
