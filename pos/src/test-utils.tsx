import React from 'react';
import {render} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {store} from '../src/store';

const AllTheProviders = ({children}: {children: React.ReactNode}) => {
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, {wrapper: AllTheProviders, ...options});

export * from '@testing-library/react-native';
export {customRender as render};
