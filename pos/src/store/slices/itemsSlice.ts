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
  items: [],
  categories: ['Favorite'],
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
