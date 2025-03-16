import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAppSelector, useAppDispatch} from '../store/hooks';
import {
  setRecipes,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
  fetchFavorites,
} from '../store/feater/recipeSlice';
import RecipeCard from './RecipeCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

// Define the navigation param list types
type RootStackParamList = {
  Home: undefined;
  RecipeDetails: {recipeId: string};
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Using TheMealDB API which is completely free to use
const API_URL = 'https://www.themealdb.com/api/json/v1/1';

// New color palette
const COLORS = {
  primary: '#FF6B35',     // Warm orange
  secondary: '#004E89',   // Deep blue
  accent: '#FCAB10',      // Golden yellow
  neutral: '#2B2D42',     // Dark slate
  light: '#F8F9FA',       // Off-white
  white: '#FFFFFF',
  gray: '#6C757D'
};

// Define recipe interface
interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  preparationTime: number;
  difficulty: string;
  category: string;
}

// Define API meal interface
interface ApiMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  [key: string]: any; // For dynamic properties like strIngredient1, etc.
}

const categories = [
  'Tout',
  'Pâtes',
  'Desserts',
  'Salades',
  'Soupes',
  'Viandes',
  'Poissons',
  'Végétarien',
];

// Mapping from TheMealDB categories to our French categories
const categoryMapping: {[key: string]: string} = {
  Pasta: 'Pâtes',
  Dessert: 'Desserts',
  Side: 'Accompagnements',
  Starter: 'Entrées',
  Breakfast: 'Petit-déjeuner',
  Beef: 'Viandes',
  Chicken: 'Viandes',
  Lamb: 'Viandes',
  Pork: 'Viandes',
  Goat: 'Viandes',
  Seafood: 'Poissons',
  Vegetarian: 'Végétarien',
  Vegan: 'Végétarien',
  Miscellaneous: 'Autre',
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {recipes, selectedCategory, searchQuery, loading, error} =
    useAppSelector(state => state.recipes);
  const [apiCategories, setApiCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchRecipes();
    dispatch(fetchFavorites());
  }, []);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/categories.php`);

      if (!response.ok) {
        throw new Error('Échec de la récupération des catégories');
      }

      const data = await response.json();
      if (data.categories) {
        setApiCategories(data.categories.map((cat: any) => cat.strCategory));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecipes = async (category?: string): Promise<void> => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const endpoint = category
        ? `${API_URL}/filter.php?c=${category}`
        : `${API_URL}/filter.php?a=Italian`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Échec de la récupération des recettes');
      }

      const data = await response.json();
      if (!data.meals) {
        dispatch(setRecipes([]));
        dispatch(setLoading(false));
        return;
      }

      const detailedRecipes = await Promise.all(
        data.meals.map(async (meal: {idMeal: string}) => {
          try {
            const detailResponse = await fetch(
              `${API_URL}/lookup.php?i=${meal.idMeal}`,
            );
            if (!detailResponse.ok) return null;

            const detailData = await detailResponse.json();
            return detailData.meals ? detailData.meals[0] : null;
          } catch (error) {
            console.error(`Error fetching recipe details for ${meal.idMeal}:`, error);
            return null;
          }
        }),
      );

      const transformedRecipes = detailedRecipes
        .filter(Boolean)
        .map((recipe: ApiMeal) => {
          const ingredients = Object.keys(recipe).filter(
            key => key.startsWith('strIngredient') && recipe[key],
          ).length;

          const steps = recipe.strInstructions
            ? recipe.strInstructions
                .split('.')
                .filter((s: string) => s.trim().length > 0).length
            : 1;

          const prepTime = Math.max(
            15,
            Math.min(120, ingredients * 5 + steps * 3),
          );

          // Determine difficulty based on preparation time and ingredients
          let difficulty;
          if (prepTime < 30) difficulty = 'Facile';
          else if (prepTime < 60) difficulty = 'Moyen';
          else difficulty = 'Difficile';

          // Map API category to our category
          const mappedCategory = categoryMapping[recipe.strCategory] || 'Autre';

          // Format description
          let description = recipe.strInstructions
            ? recipe.strInstructions.substring(0, 100) + '...'
            : 'Délicieuse recette italienne';

          return {
            id: recipe.idMeal,
            name: recipe.strMeal,
            image: recipe.strMealThumb,
            description: description,
            preparationTime: prepTime,
            difficulty: difficulty,
            category: mappedCategory,
          };
        });

      dispatch(setRecipes(transformedRecipes));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      dispatch(
        setError(
          'Impossible de charger les recettes. Veuillez réessayer plus tard.',
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string): void => {
    dispatch(setSelectedCategory(category));

    if (category !== 'Tout') {
      // Find the API category that maps to our selected category
      const apiCategory = Object.keys(categoryMapping).find(
        key => categoryMapping[key] === category,
      );

      if (apiCategory && apiCategories.includes(apiCategory)) {
        fetchRecipes(apiCategory);
      }
    } else {
      // If "All" is selected, fetch Italian recipes
      fetchRecipes();
    }
  };

  // Filter recipes based on search
  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesSearch =
      searchQuery.length === 0 ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle recipe selection
  const handleRecipePress = (recipe: Recipe): void => {
    // Navigate to recipe details screen
    navigation.navigate('RecipeDetails', {recipeId: recipe.id});
  };

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={60} color={COLORS.primary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchRecipes()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.headerWrapper}>
        <ImageBackground 
          source={{uri: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=1000'}}
          style={styles.headerBackground}>
          <LinearGradient
            colors={[COLORS.primary, 'rgba(0,0,0,0.8)']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.headerGradient}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Pepe Nero</Text>
              <Text style={styles.headerSubtitle}>
                Découvrez des recettes délicieuses
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon
            name="search"
            size={22}
            color={COLORS.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une recette..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={text => dispatch(setSearchQuery(text))}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleCategoryChange(item)}
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      ) : (
        <>
          <View style={styles.recipesHeaderContainer}>
            <Text style={styles.sectionTitle}>Nos Recettes</Text>
            <Text style={styles.recipeCount}>{filteredRecipes.length} résultats</Text>
          </View>
          <FlatList
            data={filteredRecipes}
            renderItem={({item, index}: {item: Recipe; index: number}) => (
              <RecipeCard
                recipe={item}
                index={index}
                onPress={() => handleRecipePress(item)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="restaurant-outline" size={70} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Aucune recette ne correspond à votre recherche'
                    : 'Aucune recette disponible'}
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    dispatch(setSearchQuery(''));
                    dispatch(setSelectedCategory('Tout'));
                    fetchRecipes();
                  }}>
                  <Text style={styles.resetButtonText}>
                    Réinitialiser les filtres
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.light,
  },
  headerWrapper: {
    height: 180,
    width: '100%',
    overflow: 'hidden',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    width: '100%', 
    height: '100%',
    justifyContent: 'flex-end',
  },
  header: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: COLORS.neutral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 20,
    paddingBottom: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.light,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  recipesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingRight: 16,
    paddingBottom: 5,
  },
  recipeCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  resetButtonText: {
    color: COLORS.neutral,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HomeScreen;