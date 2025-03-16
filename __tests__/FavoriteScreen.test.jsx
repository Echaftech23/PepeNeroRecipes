import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FavoritesScreen from '../FavoritesScreen';
import { fetchFavorites, toggleFavorite } from '../store/feater/recipeSlice';

// Création d'un mock store
const mockStore = configureStore([]);
const navigationMock = { navigate: jest.fn() };

describe('FavoritesScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      recipes: {
        favorites: [],
        loading: false,
      },
    });
    store.dispatch = jest.fn();
  });

  test('affiche le loader lorsqu’on charge les données', () => {
    store = mockStore({
      recipes: { favorites: [], loading: true },
    });

    render(
      <Provider store={store}>
        <FavoritesScreen navigation={navigationMock} />
      </Provider>
    );

    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  test("affiche un message si aucune recette favorite n'est enregistrée", () => {
    render(
      <Provider store={store}>
        <FavoritesScreen navigation={navigationMock} />
      </Provider>
    );

    expect(screen.getByText("Vous n'avez pas encore de recettes favorites")).toBeTruthy();
  });

  test('affiche correctement la liste des recettes favorites', () => {
    store = mockStore({
      recipes: {
        favorites: [
          { id: '1', name: 'Pizza', image: 'https://example.com/pizza.jpg' },
          { id: '2', name: 'Salade', image: 'https://example.com/salade.jpg' },
        ],
        loading: false,
      },
    });

    render(
      <Provider store={store}>
        <FavoritesScreen navigation={navigationMock} />
      </Provider>
    );

    expect(screen.getByText('Pizza')).toBeTruthy();
    expect(screen.getByText('Salade')).toBeTruthy();
  });

  test("supprime une recette favorite lorsqu'on appuie sur le bouton ❤️", () => {
    store = mockStore({
      recipes: {
        favorites: [{ id: '1', name: 'Pizza', image: 'https://example.com/pizza.jpg' }],
        loading: false,
      },
    });

    render(
      <Provider store={store}>
        <FavoritesScreen navigation={navigationMock} />
      </Provider>
    );

    const heartButton = screen.getByText('❤️');
    fireEvent.press(heartButton);

    expect(store.dispatch).toHaveBeenCalledWith(toggleFavorite({ id: '1', name: 'Pizza', image: 'https://example.com/pizza.jpg' }));
  });
});
