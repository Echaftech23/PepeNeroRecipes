import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFavorites, toggleFavorite} from '../store/feater/recipeSlice';
import {RootState} from '../store/store'; 

const FavoritesScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const {favorites, loading} = useSelector((state: RootState) => state.recipes);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const removeFavorite = (recipe: any) => {
    dispatch(toggleFavorite(recipe));
  };

  const renderRecipeCard = ({item}: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', {recipeId: item.id})}>
      <Image source={{uri: item.image}} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item)}>
          <Text style={{fontSize: 24, color: '#DC2626'}}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{fontSize: 64, color: '#ccc'}}>🤍</Text>
        <Text style={styles.emptyText}>
          Vous n'avez pas encore de recettes favorites
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.exploreButtonText}>Explorer les recettes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderRecipeCard}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FavoritesScreen;
