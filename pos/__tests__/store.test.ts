import {RootState} from '../store';

describe('Store Configuration', () => {
  it('should configure store with persistence', () => {
    const {store, persistor} = require('../store');
    expect(store).toBeDefined();
    expect(persistor).toBeDefined();
    expect(store.getState()).toHaveProperty('cart');
    expect(store.getState()).toHaveProperty('items');
  });
});
