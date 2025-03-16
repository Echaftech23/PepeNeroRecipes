
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  preparationTime: number;
  difficulty: string;
  category: string;
}

interface RecipeState {
  recipes: Recipe[];
  selectedCategory: string;
  searchQuery: string;
  favorites: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: RecipeState = {
  recipes: [],
  selectedCategory: 'Tout',
  searchQuery: '',
  favorites: [],
  loading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  'recipes/fetchFavorites',
  async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem('favorites');
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async (recipe: Recipe, {getState}) => {
    const {recipes} = getState() as {recipes: RecipeState};
    const currentFavorites = [...recipes.favorites];

    const isFavorite = currentFavorites.some(fav => fav.id === recipe.id);
    let newFavorites: Recipe[];

    if (isFavorite) {
      newFavorites = currentFavorites.filter(fav => fav.id !== recipe.id);
    } else {
      newFavorites = [...currentFavorites, recipe];
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    return newFavorites;
  },
);

export const addRecipe = createAsyncThunk(
  'recipes/addRecipe',
  async (recipe: Recipe, {getState}) => {
    const {recipes} = getState() as {recipes: RecipeState};
    const newRecipes = [
      ...recipes.recipes,
      {...recipe, id: Date.now().toString()},
    ];

    await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
    return newRecipes;
  },
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.recipes = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });

    builder.addCase(addRecipe.fulfilled, (state, action) => {
      state.recipes = action.payload;
    });
  },
});

export const {
  setRecipes,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
} = recipeSlice.actions;

export default recipeSlice.reducer;
