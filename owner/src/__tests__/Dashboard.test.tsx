import {render} from './test-utils';
import Dashboard from './pages/Dashboard';

describe('Dashboard', () => {
  it('should render dashboard title', () => {
    const {getByText} = render(<Dashboard />);
    expect(getByText('Grocery Owner Dashboard')).toBeInTheDocument();
  });
});
