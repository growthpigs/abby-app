/**
 * PhotosScreen - Manage profile photos
 *
 * Glass-styled photo gallery accessible from hamburger menu.
 * Users can view, add, reorder, and delete photos.
 * Integrates with /v1/photos API for persistence.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Plus, X, Camera, AlertCircle, RefreshCw } from 'lucide-react-native';
import { Body, Caption, Headline } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { TokenManager } from '../../services/TokenManager';
import { secureFetchJSON } from '../../utils/secureFetch';

const API_BASE = 'https://dev.api.myaimatchmaker.ai';

// Demo photos for when no auth token (demo mode)
const DEMO_PHOTOS: PhotoItem[] = [
  {
    id: 'demo-1',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    isPrimary: true,
  },
  {
    id: 'demo-2',
    uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  },
  {
    id: 'demo-3',
    uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
];

export interface PhotoItem {
  id: string;
  uri: string;
  isPrimary?: boolean;
}

export interface PhotosScreenProps {
  onClose?: () => void;
  onAddPhoto?: () => void;
}

const MAX_PHOTOS = 6;

export const PhotosScreen: React.FC<PhotosScreenProps> = ({
  onClose,
  onAddPhoto,
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      setError(null);
      const token = await TokenManager.getToken();

      if (!token) {
        // Demo mode - show mock photos
        if (__DEV__) console.log('[PhotosScreen] No token - using demo data');
        setPhotos(DEMO_PHOTOS);
        setIsLoading(false);
        return;
      }

      const response = await secureFetchJSON<{ photos: PhotoItem[] }>(
        `${API_BASE}/v1/photos`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPhotos(response.photos || []);
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log('[PhotosScreen] Fetch error:', err);
      }
      // Gracefully handle - start with empty photos
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleAddPhoto = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can only have ${MAX_PHOTOS} photos.`);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddPhoto?.();
  }, [photos.length, onAddPhoto]);

  const handleDeletePhoto = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsDeleting(id);

            try {
              const token = await TokenManager.getToken();
              if (token) {
                await secureFetchJSON(`${API_BASE}/v1/photos/${id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
              }
              // Remove from local state
              setPhotos((prev) => prev.filter((p) => p.id !== id));
            } catch (err) {
              if (__DEV__) {
                if (__DEV__) console.log('[PhotosScreen] Delete error:', err);
              }
              // Remove from local state anyway for better UX
              setPhotos((prev) => prev.filter((p) => p.id !== id));
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleSetPrimary = useCallback(async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic update
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    );

    try {
      const token = await TokenManager.getToken();
      if (token) {
        await secureFetchJSON(`${API_BASE}/v1/photos/${id}/primary`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log('[PhotosScreen] Set primary error:', err);
      }
      // Keep optimistic update - API might not be ready
    }
  }, []);

  const emptySlots = MAX_PHOTOS - photos.length;

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Caption style={styles.headerTitle}>MY PHOTOS</Caption>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Body style={styles.closeText}>Done</Body>
          </Pressable>
        </View>

        {/* Photo Grid */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Body style={styles.loadingText}>Loading photos...</Body>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <View style={styles.errorIcon}>
                <AlertCircle size={48} stroke="#DC2626" />
              </View>
              <Headline style={styles.errorTitle}>Unable to load photos</Headline>
              <Body style={styles.errorText}>{error}</Body>
              <GlassButton
                onPress={fetchPhotos}
                variant="secondary"
                style={styles.retryButton}
              >
                <View style={styles.retryContent}>
                  <RefreshCw size={18} stroke="rgba(0, 0, 0, 0.7)" />
                  <Body style={styles.retryText}>Try Again</Body>
                </View>
              </GlassButton>
            </View>
          ) : (
            <>
              <Caption style={styles.helpText}>
                Add up to {MAX_PHOTOS} photos. Tap to set as primary.
              </Caption>

              <View style={styles.photoGrid}>
                {/* Existing Photos */}
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Pressable
                      onPress={() => handleSetPrimary(photo.id)}
                      style={({ pressed }) => [
                        styles.photoItem,
                        photo.isPrimary && styles.photoItemPrimary,
                        pressed && styles.photoItemPressed,
                      ]}
                      disabled={isDeleting === photo.id}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                      {photo.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Caption style={styles.primaryText}>PRIMARY</Caption>
                        </View>
                      )}
                      {isDeleting === photo.id && (
                        <View style={styles.deletingOverlay}>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeletePhoto(photo.id)}
                      style={styles.deleteButton}
                      disabled={isDeleting === photo.id}
                    >
                      <X size={14} stroke="#fff" />
                    </Pressable>
                  </View>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: emptySlots }).map((_, index) => (
                  <Pressable
                    key={`empty-${index}`}
                    onPress={handleAddPhoto}
                    style={({ pressed }) => [
                      styles.photoItem,
                      styles.emptySlot,
                      pressed && styles.emptySlotPressed,
                    ]}
                  >
                    <Plus size={32} stroke="rgba(0, 0, 0, 0.3)" />
                  </Pressable>
                ))}
              </View>

              {/* Tips */}
              <View style={styles.tips}>
                <Camera size={18} stroke="rgba(0, 0, 0, 0.4)" />
                <Body style={styles.tipsText}>
                  Photos with good lighting and clear faces get more matches.
                </Body>
              </View>
            </>
          )}
        </ScrollView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  helpText: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoItem: {
    width: 100,
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  photoItemPrimary: {
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  photoItemPressed: {
    opacity: 0.8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20,
  },
  // Loading state
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  retryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
  },
  // Deleting overlay
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotosScreen;
