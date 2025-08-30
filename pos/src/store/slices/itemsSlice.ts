import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  isFavorite: boolean;
}

interface ItemsState {
  items: Item[];
  categories: string[];
}

const initialState: ItemsState = {
  items: [
    { id: '1', name: 'Apple', price: 2.5, category: 'Fruits', unit: 'kg', isFavorite: true },
    { id: '2', name: 'Bread', price: 3.0, category: 'Bakery', unit: 'loaf', isFavorite: true },
    { id: '3', name: 'Milk', price: 1.5, category: 'Dairy', unit: 'liter', isFavorite: false },
    { id: '4', name: 'Banana', price: 1.2, category: 'Fruits', unit: 'kg', isFavorite: false },
    { id: '5', name: 'Cheese', price: 5.0, category: 'Dairy', unit: 'kg', isFavorite: false },
  ],
  categories: ['Favorite', 'Fruits', 'Bakery', 'Dairy'],
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const {setItems, addCategory, updateItem} = itemsSlice.actions;
export default itemsSlice.reducer;
