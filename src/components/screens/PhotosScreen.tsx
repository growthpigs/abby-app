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
  useWindowDimensions,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Plus, X, Camera, AlertCircle, RefreshCw } from 'lucide-react-native';
import { Body, Caption, Headline } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { TokenManager } from '../../services/TokenManager';
import { secureFetchJSON } from '../../utils/secureFetch';
import { API_CONFIG } from '../../config';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { sharedStyles, LAYOUT, TYPOGRAPHY, COLORS } from '../../constants/onboardingLayout';

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
  const layout = useResponsiveLayout();
  const { width: screenWidth } = useWindowDimensions();

  // Calculate responsive photo dimensions based on screen width
  // 3 photos per row with gaps and horizontal padding
  const photoGap = layout.isSmallScreen ? 8 : 12;
  const horizontalPadding = layout.paddingHorizontal;
  const photoWidth = Math.floor((screenWidth - (horizontalPadding * 2) - (photoGap * 2)) / 3);
  const photoHeight = Math.floor(photoWidth * 1.3); // Maintain 1:1.3 aspect ratio

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
        `${API_CONFIG.API_URL}/photos`,
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
                await secureFetchJSON(`${API_CONFIG.API_URL}/photos/${id}`, {
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
        await secureFetchJSON(`${API_CONFIG.API_URL}/photos/${id}/primary`, {
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
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        {/* Header with Headline */}
        <View style={[styles.header, { paddingTop: LAYOUT.content.paddingTop, paddingHorizontal: LAYOUT.content.paddingHorizontal }]}>
          <Text style={sharedStyles.headline}>My Photos</Text>
        </View>

        {/* Close button - absolute positioned using shared design system */}
        <Pressable
          onPress={onClose}
          style={sharedStyles.closeButton}
          hitSlop={10}
        >
          <X size={24} stroke={COLORS.charcoal.medium} />
        </Pressable>

        {/* Photo Grid */}
        <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingVertical: LAYOUT.spacing.large, paddingHorizontal: LAYOUT.content.paddingHorizontal }]}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#E11D48" />
              <Body style={styles.loadingText}>Loading photos...</Body>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <View style={styles.errorIcon}>
                <AlertCircle size={48} stroke={COLORS.red.primary} />
              </View>
              <Headline style={styles.errorTitle}>Unable to load photos</Headline>
              <Body style={styles.errorText}>{error}</Body>
              <GlassButton
                onPress={fetchPhotos}
                variant="secondary"
                style={styles.retryButton}
              >
                <View style={styles.retryContent}>
                  <RefreshCw size={18} stroke={COLORS.charcoal.medium} />
                  <Body style={styles.retryText}>Try Again</Body>
                </View>
              </GlassButton>
            </View>
          ) : (
            <>
              <Caption style={[styles.helpText, { marginBottom: LAYOUT.spacing.large }]}>
                Add up to {MAX_PHOTOS} photos. Tap to set as primary.
              </Caption>

              <View style={[styles.photoGrid, { gap: photoGap }]}>
                {/* Existing Photos */}
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Pressable
                      onPress={() => handleSetPrimary(photo.id)}
                      style={({ pressed }) => [
                        styles.photoItem,
                        { width: photoWidth, height: photoHeight },
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
                          <ActivityIndicator size="small" color={COLORS.white.full} />
                        </View>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeletePhoto(photo.id)}
                      style={styles.deleteButton}
                      disabled={isDeleting === photo.id}
                    >
                      <X size={14} stroke={COLORS.white.full} />
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
                      { width: photoWidth, height: photoHeight },
                      styles.emptySlot,
                      pressed && styles.emptySlotPressed,
                    ]}
                  >
                    <Plus size={layout.isSmallScreen ? 24 : 32} stroke={COLORS.charcoal.light} />
                  </Pressable>
                ))}
              </View>

              {/* Tips */}
              <View style={[styles.tips, { marginTop: LAYOUT.spacing.xxl, padding: layout.isSmallScreen ? LAYOUT.spacing.medium : LAYOUT.spacing.default }]}>
                <Camera size={layout.isSmallScreen ? 16 : 18} stroke={COLORS.charcoal.light} />
                <Body style={[styles.tipsText, { fontSize: layout.bodyFontSize - 2 }]}>
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
    paddingBottom: LAYOUT.spacing.default,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white[10],
  },
  // closeButton removed - using sharedStyles.closeButton instead
  content: {
    flex: 1,
  },
  contentContainer: {
    // paddingVertical and paddingHorizontal applied dynamically via LAYOUT constants
  },
  helpText: {
    textAlign: 'center',
    color: COLORS.charcoal.light,
    // marginBottom applied dynamically via LAYOUT.spacing.large
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap applied dynamically via photoGap
    justifyContent: 'flex-start',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoItem: {
    // width and height applied dynamically based on screen width
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white[10],
  },
  photoItemPrimary: {
    borderWidth: 2,
    borderColor: '#E11D48', // PASSION pink - matches design system
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
    backgroundColor: '#E11D48', // PASSION pink
    paddingVertical: LAYOUT.spacing.micro,
    alignItems: 'center',
  },
  primaryText: {
    color: COLORS.white.full,
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
    // No shadows - clean design
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)', // Charcoal border for contrast on light blur
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)', // Subtle gray fill for visibility
  },
  emptySlotPressed: {
    backgroundColor: COLORS.white[10],
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.medium,
    // marginTop and padding applied dynamically via LAYOUT constants
    backgroundColor: 'rgba(100, 100, 100, 0.1)', // Charcoal tint for visibility on light blur
    borderRadius: 12,
  },
  tipsText: {
    flex: 1,
    // fontSize applied dynamically via layout.bodyFontSize
    color: COLORS.charcoal.medium,
    lineHeight: 20,
  },
  // Loading state
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: LAYOUT.spacing.default,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.charcoal.light,
  },
  // Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.red.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.small,
    color: COLORS.charcoal.dark,
  },
  errorText: {
    fontSize: TYPOGRAPHY.helpText.fontSize + 2,
    textAlign: 'center',
    lineHeight: 20,
    color: COLORS.charcoal.light,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: LAYOUT.spacing.large,
  },
  retryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.small,
  },
  retryText: {
    color: COLORS.charcoal.medium,
    fontWeight: '500',
  },
  // Deleting overlay
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotosScreen;
