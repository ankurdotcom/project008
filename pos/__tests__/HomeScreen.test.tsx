import {render} from '../src/test-utils';
import HomeScreen from '../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('should render correctly', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('Grocery POS Terminal')).toBeTruthy();
  });

  it('should display items grouped by category', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('Fruits')).toBeTruthy();
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('Banana')).toBeTruthy();
    expect(getByText('Bakery')).toBeTruthy();
    expect(getByText('Bread')).toBeTruthy();
    expect(getByText('Dairy')).toBeTruthy();
    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Cheese')).toBeTruthy();
  });
});
