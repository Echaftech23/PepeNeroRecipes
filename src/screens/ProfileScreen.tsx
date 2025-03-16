import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface UserStats {
  recipes: number;
  favorites: number;
  followers: number;
  following: number;
}

interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  bio: string;
  stats: UserStats;
}

const mockUserProfile: UserProfile = {
  name: 'Sophie Martin',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  email: 'sophie.martin@example.com',
  bio: 'Passionnée de cuisine italienne | Chef amateur | Créatrice de contenu culinaire',
  stats: {
    recipes: 24,
    favorites: 156,
    followers: 1420,
    following: 890
  }
};

const ProfileOption: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}> = ({ icon, title, subtitle, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.option,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.optionIcon}>
          <Icon name={icon} size={24} color="#DC2626" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          )}
        </View>
        <Icon name="chevron-forward" size={24} color="#666" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const StatItem: React.FC<{
  value: number;
  label: string;
}> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: mockUserProfile.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{mockUserProfile.name}</Text>
            <Text style={styles.email}>{mockUserProfile.email}</Text>
          </View>
        </View>
        
        <Text style={styles.bio}>{mockUserProfile.bio}</Text>
        
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <StatItem value={mockUserProfile.stats.recipes} label="Recettes" />
        <StatItem value={mockUserProfile.stats.favorites} label="Favoris" />
        <StatItem value={mockUserProfile.stats.followers} label="Abonnés" />
        <StatItem value={mockUserProfile.stats.following} label="Abonnements" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres du compte</Text>
        <ProfileOption
          icon="person-outline"
          title="Informations personnelles"
          subtitle="Nom, email, mot de passe"
        />
        <ProfileOption
          icon="notifications-outline"
          title="Notifications"
          subtitle="Préférences de notification"
        />
        <ProfileOption
          icon="language-outline"
          title="Langue"
          subtitle="Français"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contenu</Text>
        <ProfileOption
          icon="restaurant-outline"
          title="Mes recettes"
          subtitle={`${mockUserProfile.stats.recipes} recettes publiées`}
        />
        <ProfileOption
          icon="heart-outline"
          title="Recettes favorites"
          subtitle={`${mockUserProfile.stats.favorites} recettes sauvegardées`}
        />
        <ProfileOption
          icon="bookmark-outline"
          title="Collections"
          subtitle="Gérer vos collections de recettes"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aide & Support</Text>
        <ProfileOption
          icon="help-circle-outline"
          title="Centre d'aide"
        />
        <ProfileOption
          icon="mail-outline"
          title="Contactez-nous"
        />
        <ProfileOption
          icon="information-circle-outline"
          title="À propos"
        />
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#DC2626',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#fff',
    marginTop: 16,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  editButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
