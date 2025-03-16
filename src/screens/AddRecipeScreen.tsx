import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

interface Recipe {
  id: string;
  name: string;
  ingredients: string;
  steps: string;
  category: string;
  preparationTime: string;
  difficulty: string;
}

// Define an initial state recipe
const initialRecipeState: Recipe = {
  id: '',
  name: '',
  ingredients: '',
  steps: '',
  category: '',
  preparationTime: '',
  difficulty: '',
};

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

const AddRecipeScreen: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe>({...initialRecipeState});
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async (): Promise<void> => {
    try {
      const storedRecipes = await AsyncStorage.getItem('recipes');
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.error('Erreur de chargement des recettes:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les recettes. Veuillez réessayer.',
      );
    }
  };

  const handleSaveRecipe = async (): Promise<void> => {
    if (
      !recipe.name ||
      !recipe.ingredients ||
      !recipe.steps ||
      !recipe.category
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
    };

    const newRecipes = [...recipes, newRecipe];

    try {
      await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
      setRecipes(newRecipes);
      Alert.alert('Succès', 'Recette ajoutée avec succès.');

      // Reset the form
      setRecipe({...initialRecipeState});
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Alert.alert(
        'Erreur',
        "Une erreur s'est produite lors de l'enregistrement de la recette.",
      );
    }
  };

  const handleDeleteRecipe = async (id: string): Promise<void> => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    try {
      await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
      setRecipes(updatedRecipes);
      Alert.alert('Succès', 'Recette supprimée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la suppression de la recette.',
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.toLowerCase() === 'facile') return '#22c55e';
    if (difficulty.toLowerCase() === 'moyen') return '#f59e0b';
    if (difficulty.toLowerCase() === 'difficile') return '#ef4444';
    return COLORS.gray;
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Icon name="restaurant-outline" size={24} color={COLORS.white} style={styles.headerIcon} />
            <Text style={styles.formHeaderTitle}>Nouvelle Recette</Text>
          </View>

          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de la recette <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Icon name="pencil-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom de la recette"
                  placeholderTextColor="#9CA3AF"
                  value={recipe.name}
                  onChangeText={(text: string) => setRecipe({...recipe, name: text})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingrédients <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.multilineInputContainer}>
                <Icon name="list-outline" size={20} color={COLORS.gray} style={{...styles.inputIcon, marginTop: 10}} />
                <TextInput
                  style={styles.multilineInput}
                  placeholder="Ex: 2 œufs, 200g de farine..."
                  placeholderTextColor="#9CA3AF"
                  value={recipe.ingredients}
                  onChangeText={(text: string) =>
                    setRecipe({...recipe, ingredients: text})
                  }
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Étapes <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.multilineInputContainer}>
                <Icon name="document-text-outline" size={20} color={COLORS.gray} style={{...styles.inputIcon, marginTop: 10}} />
                <TextInput
                  style={styles.multilineInput}
                  placeholder="Expliquer les étapes de préparation..."
                  placeholderTextColor="#9CA3AF"
                  value={recipe.steps}
                  onChangeText={(text: string) => setRecipe({...recipe, steps: text})}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Icon name="pricetag-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Pizza, Desserts..."
                  placeholderTextColor="#9CA3AF"
                  value={recipe.category}
                  onChangeText={(text: string) =>
                    setRecipe({...recipe, category: text})
                  }
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.label}>Temps</Text>
                <View style={styles.inputContainer}>
                  <Icon name="time-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Minutes"
                    placeholderTextColor="#9CA3AF"
                    value={recipe.preparationTime}
                    onChangeText={(text: string) =>
                      setRecipe({...recipe, preparationTime: text})
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.label}>Difficulté</Text>
                <View style={styles.inputContainer}>
                  <Icon name="speedometer-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Facile, Moyen..."
                    placeholderTextColor="#9CA3AF"
                    value={recipe.difficulty}
                    onChangeText={(text: string) =>
                      setRecipe({...recipe, difficulty: text})
                    }
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSaveRecipe}>
              <Icon name="save-outline" size={20} color={COLORS.white} style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Enregistrer la recette</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recipesSection}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="bookmark" size={22} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Mes recettes</Text>
          </View>

          {recipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={60} color="#CCD1D1" />
              <Text style={styles.emptyStateText}>
                Vous n'avez pas encore ajouté de recettes.
              </Text>
            </View>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.recipeCard}>
                  <View style={styles.recipeCardHeader}>
                    <Text style={styles.recipeName}>{item.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.recipeDetails}>
                    {item.preparationTime ? (
                      <View style={styles.detailItem}>
                        <Icon name="time-outline" size={16} color={COLORS.gray} />
                        <Text style={styles.recipeDetail}>{item.preparationTime} min</Text>
                      </View>
                    ) : null}
                    
                    {item.difficulty ? (
                      <View style={styles.detailItem}>
                        <Icon name="speedometer-outline" size={16} color={COLORS.gray} />
                        <Text style={[
                          styles.recipeDetail, 
                          {color: getDifficultyColor(item.difficulty)}
                        ]}>
                          {item.difficulty}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRecipe(item.id)}>
                    <Icon name="trash-outline" size={16} color={COLORS.white} style={{marginRight: 5}} />
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

