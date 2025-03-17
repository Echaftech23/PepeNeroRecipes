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
import {
  Utensils,
  Pencil,
  ListOrdered,
  FileText,
  Tag,
  Clock,
  Gauge,
  Save,
  Bookmark,
  Trash2,
  Plus
} from 'lucide-react-native';

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
            <Utensils size={22} color={COLORS.white} style={styles.headerIcon} />
            <Text style={styles.formHeaderTitle}>Nouvelle Recette</Text>
          </View>

          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de la recette <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Pencil size={18} color={COLORS.gray} style={styles.inputIcon} />
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
                <ListOrdered size={18} color={COLORS.gray} style={{...styles.inputIcon, marginTop: 10}} />
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
                <FileText size={18} color={COLORS.gray} style={{...styles.inputIcon, marginTop: 10}} />
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
                <Tag size={18} color={COLORS.gray} style={styles.inputIcon} />
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
                  <Clock size={18} color={COLORS.gray} style={styles.inputIcon} />
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
                  <Gauge size={18} color={COLORS.gray} style={styles.inputIcon} />
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
              <Save size={18} color={COLORS.white} style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Enregistrer la recette</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recipesSection}>
          <View style={styles.sectionTitleContainer}>
            <Bookmark size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Mes recettes</Text>
          </View>

          {recipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Utensils size={60} color="#CCD1D1" />
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
                        <Clock size={14} color={COLORS.gray} />
                        <Text style={styles.recipeDetail}>{item.preparationTime} min</Text>
                      </View>
                    ) : null}
                    
                    {item.difficulty ? (
                      <View style={styles.detailItem}>
                        <Gauge size={14} color={COLORS.gray} />
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
                    <Trash2 size={14} color={COLORS.white} style={{marginRight: 5}} />
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

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.light,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    backgroundColor: COLORS.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  formHeaderTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.neutral,
  },
  requiredStar: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.neutral,
  },
  multilineInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  multilineInput: {
    flex: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 8,
    fontSize: 15,
    color: COLORS.neutral,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral,
    marginLeft: 8,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  recipeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.neutral,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.neutral,
    fontWeight: '500',
  },
  recipeDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeDetail: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AddRecipeScreen;