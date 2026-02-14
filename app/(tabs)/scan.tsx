import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { mockSkinAnalysis } from '@/services/skinAnalysisService';
import { useApp } from '@/hooks/useApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const { addSkinHistory, isDetailedMode } = useApp();
  const cameraRef = useRef<CameraView>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  if (!permission) {
    return <LoadingSpinner message="Loading camera..." />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color={Colors.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to analyze your skin condition
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const analyzeSkin = async (imageUri: string) => {
    try {
      // Validate image URI
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI');
      }

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = mockSkinAnalysis(imageUri);
      const historyItem = {
        id: Date.now().toString(),
        imageUri,
        result,
        timestamp: Date.now(),
      };
      
      addSkinHistory(historyItem);
      router.push({
        pathname: '/scan-result',
        params: { historyId: historyItem.id }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      showAlert('Error', 'Camera not ready. Please try again.');
      return;
    }
    
    if (isLoading) return; // Prevent multiple simultaneous captures
    
    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      
      if (photo?.uri) {
        await analyzeSkin(photo.uri);
      } else {
        showAlert('Error', 'Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showAlert('Error', 'Camera error. Please check permissions and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    if (isLoading) return; // Prevent multiple simultaneous selections
    
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Required', 'Please grant photo library access to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setIsLoading(true);
        await analyzeSkin(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert('Error', 'Failed to access photo library. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    try {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    } catch (error) {
      console.error('Error flipping camera:', error);
      showAlert('Error', 'Failed to flip camera. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message={isDetailedMode ? "Analyzing skin condition..." : "Looking at your skin..."} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDetailedMode ? 'Skin Analysis' : 'Take a Photo'}
        </Text>
        <Text style={styles.subtitle}>
          {isDetailedMode 
            ? 'Position the affected area in the center of the frame'
            : 'Point camera at your skin and take a clear photo'
          }
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.overlay}>
            <View style={styles.targetArea}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
          <MaterialIcons name="photo-library" size={24} color={Colors.primary} />
          <Text style={styles.controlText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <MaterialIcons name="flip-camera-ios" size={24} color={Colors.primary} />
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <MaterialIcons name="lightbulb" size={20} color={Colors.warning} />
        <Text style={styles.tipsText}>
          {isDetailedMode 
            ? 'Ensure good lighting and steady hands for accurate analysis'
            : 'Use good light and hold steady for best results'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  permissionButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetArea: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.background,
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipsText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
  },
});