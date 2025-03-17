import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import {Home, Heart, Plus} from 'lucide-react-native';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetails: {recipeId: string};
  Search: undefined;
  Favorites: undefined;
  AddRecipe: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B35',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Pepe Nero', headerShown: false}}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailScreen}
        options={({route}) => ({
          title: '',
          headerTransparent: true,
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
};


const AddButton = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <View style={styles.addButtonInner}>
        <Plus size={24} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({focused, color, size}) => {
            if (route.name === 'Home') {
              return <Home size={size} color={color} />;
            } else if (route.name === 'Favorites') {
              return <Heart size={size} color={color} />;
            }
            return null;
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingVertical: 5,
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          },
          tabBarLabelStyle: {
            paddingBottom: 5,
            fontSize: 12,
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{tabBarLabel: 'Accueil'}}
        />
        <Tab.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
          options={{
            tabBarLabel: '',
            tabBarButton: (props) => <AddButton {...props} />,
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitle: 'Ajouter une recette',
            headerShown: true,
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel: 'Favoris',
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitle: 'Favoris',
            headerShown: true,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
