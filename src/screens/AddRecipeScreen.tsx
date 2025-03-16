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

// Define types for our recipe
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

    // Create a new recipe with a unique ID
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(), // Use timestamp as a simple unique ID
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Ajouter une recette</Text>

        <Text style={styles.label}>Nom de la recette: *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de la recette"
          value={recipe.name}
          onChangeText={(text: string) => setRecipe({...recipe, name: text})}
        />

        <Text style={styles.label}>Ingrédients: *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Ex: 2 œufs, 200g de farine..."
          value={recipe.ingredients}
          onChangeText={(text: string) =>
            setRecipe({...recipe, ingredients: text})
          }
          multiline
        />

        <Text style={styles.label}>Étapes: *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Expliquer les étapes de préparation..."
          value={recipe.steps}
          onChangeText={(text: string) => setRecipe({...recipe, steps: text})}
          multiline
        />

        <Text style={styles.label}>Catégorie: *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Pizza, Desserts..."
          value={recipe.category}
          onChangeText={(text: string) =>
            setRecipe({...recipe, category: text})
          }
        />

        <Text style={styles.label}>Temps de préparation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 30 minutes"
          value={recipe.preparationTime}
          onChangeText={(text: string) =>
            setRecipe({...recipe, preparationTime: text})
          }
          keyboardType="numeric"
        />

        <Text style={styles.label}>Difficulté:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Facile, Moyen, Difficile"
          value={recipe.difficulty}
          onChangeText={(text: string) =>
            setRecipe({...recipe, difficulty: text})
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleSaveRecipe}>
          <Text style={styles.buttonText}>Enregistrer la recette</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>📌 Mes recettes</Text>

        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
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
                <Text style={styles.recipeName}>{item.name}</Text>
                <Text style={styles.recipeCategory}>
                  Catégorie: {item.category}
                </Text>
                {item.preparationTime ? (
                  <Text style={styles.recipeDetail}>
                    Temps: {item.preparationTime} min
                  </Text>
                ) : null}
                {item.difficulty ? (
                  <Text style={styles.recipeDetail}>
                    Difficulté: {item.difficulty}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRecipe(item.id)}>
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scroll inside FlatList as we're inside ScrollView
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#DC2626',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  recipeCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recipeCategory: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  recipeDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 100,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AddRecipeScreen;
