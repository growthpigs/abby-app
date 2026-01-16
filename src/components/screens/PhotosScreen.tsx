/**
 * PhotosScreen - Manage profile photos
 *
 * Glass-styled photo gallery accessible from hamburger menu.
 * Uses GlassSheet for animated bottom-to-top entry (matches CertificationScreen)
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, X, Camera, AlertCircle, RefreshCw } from 'lucide-react-native';
import { GlassSheet } from '../ui/GlassSheet';
import { Body, Caption, Headline } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { TokenManager } from '../../services/TokenManager';
import { secureFetchJSON } from '../../utils/secureFetch';
import { API_CONFIG } from '../../config';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { LAYOUT, TYPOGRAPHY, COLORS } from '../../constants/onboardingLayout';

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

  const photoGap = layout.isSmallScreen ? 8 : 12;
  const horizontalPadding = 24;
  const photoWidth = Math.floor((screenWidth - (horizontalPadding * 2) - (photoGap * 2)) / 3);
  const photoHeight = Math.floor(photoWidth * 1.3);

  const fetchPhotos = useCallback(async () => {
    try {
      setError(null);
      const token = await TokenManager.getToken();

      if (!token) {
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
      if (__DEV__) console.log('[PhotosScreen] Fetch error:', err);
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
              setPhotos((prev) => prev.filter((p) => p.id !== id));
            } catch (err) {
              if (__DEV__) console.log('[PhotosScreen] Delete error:', err);
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
      if (__DEV__) console.log('[PhotosScreen] Set primary error:', err);
    }
  }, []);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  }, [onClose]);

  const emptySlots = MAX_PHOTOS - photos.length;

  return (
    <View style={styles.container}>
      <GlassSheet height={1}>
        {/* Header - centered label like CertificationScreen */}
        <Caption style={styles.label}>MY PHOTOS</Caption>

        {/* Photo Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
              <Caption style={styles.helpText}>
                Add up to {MAX_PHOTOS} photos. Tap to set as primary.
              </Caption>

              <View style={[styles.photoGrid, { gap: photoGap }]}>
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

              <View style={styles.tips}>
                <Camera size={layout.isSmallScreen ? 16 : 18} stroke={COLORS.charcoal.light} />
                <Body style={styles.tipsText}>
                  Photos with good lighting and clear faces get more matches.
                </Body>
              </View>
            </>
          )}
        </ScrollView>
      </GlassSheet>

      {/* Close button - OUTSIDE GlassSheet, same vertical position as hamburger */}
      <Pressable
        onPress={handleClose}
        style={styles.closeButton}
        hitSlop={10}
      >
        <X size={24} stroke="rgba(255, 255, 255, 0.95)" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  label: {
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 8,
    letterSpacing: 1,
    fontSize: 11,
    color: '#6A6A6A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  helpText: {
    textAlign: 'center',
    color: COLORS.charcoal.light,
    marginBottom: LAYOUT.spacing.large,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white[10],
  },
  photoItemPrimary: {
    borderWidth: 2,
    borderColor: '#E11D48',
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
    backgroundColor: '#E11D48',
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
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  emptySlotPressed: {
    backgroundColor: COLORS.white[10],
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.medium,
    marginTop: LAYOUT.spacing.xxl,
    padding: LAYOUT.spacing.default,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.charcoal.medium,
    lineHeight: 20,
  },
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
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Close button - same vertical position as hamburger menu (top: 12)
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
});

export default PhotosScreen;
