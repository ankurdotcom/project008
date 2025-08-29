import {combineReducers} from '@reduxjs/toolkit';
import salesReducer from './slices/salesSlice';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  sales: salesReducer,
  settings: settingsReducer,
});

export default rootReducer;
