import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';

import App from './App';

jest.mock('axios');

describe('App', () => {
  const stories = [
    { id: '1', title: 'Hello' },
    { id: '2', title: 'React' },
  ];

  test('should fetch stories with query from component props when component mounts', async () => {
    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    render(<App query="React" />);

    expect(axios.get).toHaveBeenCalledWith(
      'http://my.api.com/stories?query=React'
    );
    await act(() => promise);
  });

  test('should fetch stories with new query from when props.query changes', async () => {
    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    const { rerender } = render(<App query="React" />);

    expect(axios.get).toHaveBeenLastCalledWith(
      'http://my.api.com/stories?query=React'
    );
    await act(() => promise);

    axios.get.mockImplementationOnce(() => promise);
    act(() => rerender(<App query="React Testing" />));

    expect(axios.get).toHaveBeenLastCalledWith(
      'http://my.api.com/stories?query=React%20Testing'
    );
  });

  test('should display stories when request resolves', async () => {
    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    render(<App query="React" />);

    await act(() => promise);
    const items = await screen.findAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Hello');
    expect(items[1]).toHaveTextContent('React');
  });

  test('should not show error as long as request resolves', async () => {
    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    await act(() => promise);
    const errorElement = screen.queryByTestId('error');

    expect(errorElement).toBeNull();
  });

  test('should show error when request fail', async () => {
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('Could not fetch stories'))
    );

    render(<App />);

    const errorElement = await waitFor(() =>
      screen.getByText('Could not fetch stories')
    );

    expect(errorElement).toBeInTheDocument();
  });

  test('should manually fetch stories when clicking "Fetch Stories" button', async () => {
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('Could not fetch stories'))
    );

    render(<App />);

    await waitFor(() => screen.getByText('Could not fetch stories'));

    let items = screen.queryAllByRole('listitem');
    expect(items).toHaveLength(0);

    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    await act(async () => {
      await userEvent.click(screen.getByRole('button'));

      await promise;
    });
    items = await screen.findAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Hello');
    expect(items[1]).toHaveTextContent('React');
  });
});
