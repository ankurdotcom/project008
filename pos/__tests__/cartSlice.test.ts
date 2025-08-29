import {addItem, removeItem, clearCart} from '../src/store/slices/cartSlice';

describe('Cart Slice', () => {
  it('should add item to cart', () => {
    const action = addItem({
      id: '1',
      name: 'Apple',
      price: 2.5,
      quantity: 2,
      unit: 'kg',
    });
    expect(action.type).toBe('cart/addItem');
    expect(action.payload).toEqual({
      id: '1',
      name: 'Apple',
      price: 2.5,
      quantity: 2,
      unit: 'kg',
    });
  });

  it('should remove item from cart', () => {
    const action = removeItem('1');
    expect(action.type).toBe('cart/removeItem');
    expect(action.payload).toBe('1');
  });

  it('should clear cart', () => {
    const action = clearCart();
    expect(action.type).toBe('cart/clearCart');
  });
});
