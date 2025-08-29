import {updateSales, addSalesData} from './store/slices/salesSlice';

describe('Sales Slice', () => {
  it('should update sales data', () => {
    const action = updateSales({total: 1000, today: 500});
    expect(action.type).toBe('sales/updateSales');
    expect(action.payload).toEqual({total: 1000, today: 500});
  });

  it('should add sales data', () => {
    const salesData = {id: '1', amount: 100};
    const action = addSalesData(salesData);
    expect(action.type).toBe('sales/addSalesData');
    expect(action.payload).toEqual(salesData);
  });
});
