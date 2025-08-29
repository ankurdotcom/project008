import {render} from '../src/test-utils';
import HomeScreen from '../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('should render correctly', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('Grocery POS Terminal')).toBeTruthy();
    expect(getByText('Welcome to the Point of Sale System')).toBeTruthy();
  });
});
