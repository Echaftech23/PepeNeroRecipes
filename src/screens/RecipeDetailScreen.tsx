import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { 
  Heart, 
  HeartOff, 
  ChevronLeft, 
  Share2, 
  AlertCircle,
  ShoppingBasket,
  List,
  Check,
  Globe,
  Utensils
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import LinearGradient from 'react-native-linear-gradient';

type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetails'>;

const API_URL = 'https://www.themealdb.com/api/json/v1/1';
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

// Color palette
const COLORS = {
  primary: '#FF6B35',     // Warm orange
  secondary: '#004E89',   // Deep blue
  accent: '#FCAB10',      // Golden yellow
  neutral: '#2B2D42',     // Dark slate
  light: '#F8F9FA',       // Off-white
  white: '#FFFFFF',
  gray: '#6C757D',
  lightGray: '#E9ECEF'
};

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
  const scrollY = useRef(new Animated.Value(0)).current;
  const animatedHeartValue = useRef(new Animated.Value(1)).current;

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

  // Transform API data into our format
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

  // Check if recipe is in favorites
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

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!recipe) return;
    
    // Animate heart
    Animated.sequence([
      Animated.timing(animatedHeartValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedHeartValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
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

  // Share recipe
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de la recette...</Text>
      </View>
    );
  }

  // Error state
  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={80} color="#CCD1D1" />
        <Text style={styles.errorTitle}>Recette non trouvée</Text>
        <Text style={styles.errorText}>Nous n'avons pas pu trouver la recette demandée.</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 280],
    outputRange: [0, HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200, 300],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight, 
            opacity: headerOpacity,
          }
        ]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.name}
          </Text>
        </View>
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}>
          
        {/* Hero image with parallax effect */}
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={{ uri: recipe.image }} 
            style={[
              styles.image,
              {
                transform: [{ scale: imageScale }],
                opacity: imageOpacity,
              }
            ]} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageFade}
          />
          
          {/* Title overlay on image */}
          <View style={styles.imageOverlay}>
            <Text style={styles.recipeTitle}>{recipe.name}</Text>
            <View style={styles.recipeMeta}>
              <View style={styles.tag}>
                <Utensils size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                <Text style={styles.tagTextWhite}>{recipe.category}</Text>
              </View>
              <View style={styles.tag}>
                <Globe size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                <Text style={styles.tagTextWhite}>{recipe.area}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              onPress={toggleFavorite} 
              style={[styles.actionButton, isFavorite && styles.actionButtonActive]}>
              <Animated.View style={{ transform: [{ scale: animatedHeartValue }] }}>
                {isFavorite ? (
                  <Heart size={24} fill={COLORS.white} color={COLORS.white} />
                ) : (
                  <Heart size={24} color={COLORS.primary} />
                )}
              </Animated.View>
              <Text style={[
                styles.actionText,
                isFavorite && styles.actionTextActive
              ]}>
                {isFavorite ? 'Favoris' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={shareRecipe} 
              style={styles.actionButton}>
              <Share2 size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>

          {/* Ingredients section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingBasket size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Ingrédients</Text>
            </View>
            
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.map((item, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientIconContainer}>
                    <Check size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.ingredientText}>
                    <Text style={styles.ingredientMeasure}>{item.measure}</Text> {item.ingredient}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <List size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Préparation</Text>
            </View>
            
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
      </Animated.ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;