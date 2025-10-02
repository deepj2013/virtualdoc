import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useQuery } from 'react-query';
import { DoctorService } from '../services/DoctorService';
import { DoctorCard } from '../components/DoctorCard';
import { SpecialtyCard } from '../components/SpecialtyCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

const { width } = Dimensions.get('window');

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distance: number;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  nextAvailableSlot?: string;
}

interface Specialty {
  id: string;
  name: string;
  icon: string;
  color: string;
  doctorCount: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby doctors.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Fetch nearby doctors
  const {
    data: nearbyDoctors,
    isLoading: isLoadingDoctors,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useQuery(
    ['nearbyDoctors', userLocation],
    () => {
      if (!userLocation) return Promise.resolve([]);
      return DoctorService.getNearbyDoctors(
        userLocation.latitude,
        userLocation.longitude,
        10 // 10km radius
      );
    },
    {
      enabled: !!userLocation,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch popular specialties
  const {
    data: specialties,
    isLoading: isLoadingSpecialties,
    error: specialtiesError,
  } = useQuery(
    'popularSpecialties',
    () => DoctorService.getPopularSpecialties(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDoctors(), getCurrentLocation()]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', {
        query: searchQuery.trim(),
        location: userLocation,
      });
    }
  };

  const handleSpecialtyPress = (specialty: Specialty) => {
    navigation.navigate('SpecialtyDoctors', {
      specialty: specialty.name,
      location: userLocation,
    });
  };

  const handleDoctorPress = (doctor: Doctor) => {
    navigation.navigate('DoctorProfile', { doctorId: doctor.id });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'urgent':
        navigation.navigate('UrgentCare');
        break;
      case 'find':
        navigation.navigate('FindDoctor');
        break;
      case 'pharmacy':
        navigation.navigate('PharmacyServices');
        break;
      case 'records':
        navigation.navigate('MyRecords');
        break;
    }
  };

  const quickActions = [
    {
      id: 'urgent',
      title: 'Urgent Care',
      icon: 'medical-bag',
      color: '#FF6B6B',
    },
    {
      id: 'find',
      title: 'Find Doctor',
      icon: 'search',
      color: '#4ECDC4',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: 'medical',
      color: '#45B7D1',
    },
    {
      id: 'records',
      title: 'My Records',
      icon: 'document-text',
      color: '#96CEB4',
    },
  ];

  if (isLoadingDoctors || isLoadingSpecialties) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome to VirtualDoc</Text>
              <Text style={styles.subtitle}>Find your perfect doctor</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={32} color="#1976d2" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties, or symptoms"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={20} color="#1976d2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={() => handleQuickAction(action.id)}
              />
            ))}
          </View>
        </View>

        {/* Nearby Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Doctors</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('NearbyDoctors')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {doctorsError ? (
            <ErrorMessage message="Failed to load nearby doctors" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.doctorsScrollView}
            >
              {nearbyDoctors?.slice(0, 5).map((doctor: Doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onPress={() => handleDoctorPress(doctor)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Specialties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Specialties</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllSpecialties')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {specialtiesError ? (
            <ErrorMessage message="Failed to load specialties" />
          ) : (
            <View style={styles.specialtiesContainer}>
              {specialties?.slice(0, 4).map((specialty: Specialty) => (
                <SpecialtyCard
                  key={specialty.id}
                  specialty={specialty}
                  onPress={() => handleSpecialtyPress(specialty)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <View style={styles.tipsContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.tipCard}
            >
              <Ionicons name="bulb" size={24} color="white" />
              <Text style={styles.tipText}>
                Regular check-ups can help prevent serious health issues
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipsContainer: {
    marginTop: 10,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  tipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
    flex: 1,
  },
});

export default HomeScreen;
