import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';

import App from './App';

jest.mock('axios');

describe('App', () => {
  test('should fetch stories from an API and displays them', async () => {
    const stories = [
      { id: '1', title: 'Hello' },
      { id: '2', title: 'React' },
    ];

    const promise = Promise.resolve({ body: { stories } });

    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    await act(() => promise);
    const items = await screen.findAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Hello');
    expect(items[1]).toHaveTextContent('React');
  });

  test('should not show error as long as request resolves', async () => {
    const stories = [
      { id: '1', title: 'Hello' },
      { id: '2', title: 'React' },
    ];

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

    const stories = [
      { id: '1', title: 'Hello' },
      { id: '2', title: 'React' },
    ];

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
