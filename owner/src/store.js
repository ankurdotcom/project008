import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  sales: {
    total: 1250.75,
    today: 342.50,
    terminals: 3
  },
  sync: {
    pending: 0,
    lastSync: new Date().toISOString()
  }
};

function rootReducer(state = initialState, action) {
  return state;
}

export const store = configureStore({
  reducer: rootReducer,
});

export default store;
