import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../store/hooks';
import {toggleFavorite} from '../store/feater/recipeSlice';

interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  preparationTime: number;
  difficulty: string;
  category: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({recipe, index, onPress}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.recipes.favorites);

  const isFavorite = favorites.some(fav => fav.id === recipe.id);

  // Animation effect
  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 3,
      useNativeDriver: true,
      delay: index * 100,
    }).start();
  }, []);

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(recipe));
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{scale: scaleAnim}],
          opacity: scaleAnim,
        },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Image source={{uri: recipe.image}} style={styles.image} />
        <View style={styles.cardContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={{fontSize: 16, color: '#666', marginRight: 4}}>
                ⏱️
              </Text>
              <Text style={styles.footerText}>
                {recipe.preparationTime} min
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={{fontSize: 16, color: '#DC2626', marginRight: 4}}>
                📊
              </Text>
              <Text style={[styles.footerText, {color: '#DC2626'}]}>
                {recipe.difficulty}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.favoriteButton}>
              <Text
                style={{
                  fontSize: 22,
                  color: isFavorite ? '#DC2626' : '#666',
                }}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
});

export default RecipeCard;
