import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SettingsState {
  email: string;
  syncInterval: number;
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  email: '',
  syncInterval: 300000, // 5 minutes
  theme: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    updateSyncInterval: (state, action: PayloadAction<number>) => {
      state.syncInterval = action.payload;
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {updateEmail, updateSyncInterval, updateTheme} = settingsSlice.actions;
export default settingsSlice.reducer;
