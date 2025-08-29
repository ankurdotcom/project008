import {combineReducers} from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import itemsReducer from './slices/itemsSlice';

const rootReducer = combineReducers({
  cart: cartReducer,
  items: itemsReducer,
});

export default rootReducer;
