import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SalesState {
  totalSales: number;
  todaySales: number;
  salesData: any[];
}

const initialState: SalesState = {
  totalSales: 0,
  todaySales: 0,
  salesData: [],
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    updateSales: (state, action: PayloadAction<{total: number; today: number}>) => {
      state.totalSales = action.payload.total;
      state.todaySales = action.payload.today;
    },
    addSalesData: (state, action: PayloadAction<any>) => {
      state.salesData.push(action.payload);
    },
  },
});

export const {updateSales, addSalesData} = salesSlice.actions;
export default salesSlice.reducer;
