import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetails'>;

const API_URL = 'https://www.themealdb.com/api/json/v1/1';

interface Ingredient {
  ingredient: string;
  measure: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  ingredients: Ingredient[];
  image: string;
  video: string;
}

const RecipeDetailScreen = ({ route, navigation }: RecipeDetailScreenProps) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    fetchRecipeDetails();
    checkFavoriteStatus();
  }, [recipeId]);

  const fetchRecipeDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/lookup.php?i=${recipeId}`);
      const data = await response.json();
      if (data.meals) {
        setRecipe(transformRecipeData(data.meals[0]));
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformRecipeData = (rawRecipe: any): Recipe => {
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = rawRecipe[`strIngredient${i}`];
      const measure = rawRecipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure });
      }
    }

    const steps = rawRecipe.strInstructions
      .split('.')
      .filter((step: string) => step.trim())
      .map((step: string) => step.trim());

    return {
      id: rawRecipe.idMeal,
      name: rawRecipe.strMeal,
      category: rawRecipe.strCategory,
      area: rawRecipe.strArea,
      instructions: steps,
      ingredients,
      image: rawRecipe.strMealThumb,
      video: rawRecipe.strYoutube,
    };
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.some((fav: Recipe) => fav.id === recipeId));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!recipe) return;
    
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray: Recipe[] = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoritesArray = favoritesArray.filter((fav: Recipe) => fav.id !== recipeId);
      } else {
        favoritesArray.push(recipe);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const shareRecipe = async () => {
    if (!recipe) return;
    
    try {
      await Share.share({
        message: `Découvrez cette délicieuse recette de ${recipe.name}!`,
        title: recipe.name,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recette non trouvée</Text>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name}
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#DC2626' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={shareRecipe} style={styles.actionButton}>
                <Icon name="share-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Icon name="restaurant-outline" size={16} color="#666" />
              <Text style={styles.tagText}>{recipe.category}</Text>
            </View>
            <View style={styles.tag}>
              <Icon name="globe-outline" size={16} color="#666" />
              <Text style={styles.tagText}>{recipe.area}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingrédients</Text>
            {recipe.ingredients.map((item, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Icon name="checkmark-circle-outline" size={20} color="#DC2626" />
                <Text style={styles.ingredientText}>
                  {item.measure} {item.ingredient}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 3,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default RecipeDetailScreen;