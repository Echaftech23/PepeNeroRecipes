import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import { View, StyleSheet } from 'react-native';
import { Home, Heart, PlusCircle } from 'lucide-react-native';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetails: { recipeId: string };
  Search: undefined;
  Favorites: undefined;
  AddRecipe: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const THEME_COLOR = '#DC2626';

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME_COLOR,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Pepe Nero',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailScreen}
        options={() => ({
          title: '',
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return <Home size={24} color={color} />;
            } else if (route.name === 'Favorites') {
              return <Heart size={24} color={color} />;
            } else if (route.name === 'AddRecipe') {
              return <PlusCircle size={24} color={color} />;
            }
            return null;
          },
          tabBarActiveTintColor: THEME_COLOR,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            backgroundColor: '#FFFFFF',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarItemStyle: {
            padding: 4,
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarLabel: 'Accueil',
          }}
        />
        <Tab.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
          options={{
            tabBarLabel: 'Ajouter',
            headerStyle: {
              backgroundColor: THEME_COLOR,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitle: 'Ajouter une recette',
            headerShown: true,
            headerTitleAlign: 'center',
            tabBarButton: props => (
              <View style={styles.addButtonContainer}>
                <View style={styles.addButton}>
                  {props.children}
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel: 'Favoris',
            headerStyle: {
              backgroundColor: THEME_COLOR,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitle: 'Favoris',
            headerShown: true,
            headerTitleAlign: 'center',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default AppNavigator;
