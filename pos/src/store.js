import { configureStore } from '@reduxjs/toolkit';

// Simple initial store for Phase 1
const initialState = {
  cart: {
    items: [],
    total: 0
  },
  items: {
    list: [
      { id: '1', name: 'Apple', price: 2.50, category: 'Fruits' },
      { id: '2', name: 'Bread', price: 3.00, category: 'Bakery' },
      { id: '3', name: 'Milk', price: 4.50, category: 'Dairy' }
    ],
    categories: ['Fruits', 'Bakery', 'Dairy']
  }
};

function rootReducer(state = initialState, action) {
  return state;
}

export const store = configureStore({
  reducer: rootReducer,
});

export default store;
