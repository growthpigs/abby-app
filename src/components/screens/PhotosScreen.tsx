/**
 * PhotosScreen - Manage profile photos
 *
 * Glass-styled photo gallery accessible from hamburger menu.
 * Users can view, add, reorder, and delete photos.
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Plus, X, Camera } from 'lucide-react-native';
import { Body, Caption } from '../ui/Typography';

export interface PhotoItem {
  id: string;
  uri: string;
  isPrimary?: boolean;
}

export interface PhotosScreenProps {
  photos?: PhotoItem[];
  onClose?: () => void;
  onAddPhoto?: () => void;
  onDeletePhoto?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
}

const MAX_PHOTOS = 6;

export const PhotosScreen: React.FC<PhotosScreenProps> = ({
  photos = [],
  onClose,
  onAddPhoto,
  onDeletePhoto,
  onSetPrimary,
}) => {
  // Reserved for future multi-select functionality
  // const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddPhoto = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can only have ${MAX_PHOTOS} photos.`);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddPhoto?.();
  }, [photos.length, onAddPhoto]);

  const handleDeletePhoto = useCallback((id: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDeletePhoto?.(id);
          },
        },
      ]
    );
  }, [onDeletePhoto]);

  const handleSetPrimary = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSetPrimary?.(id);
  }, [onSetPrimary]);

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
          <Caption style={styles.helpText}>
            Add up to {MAX_PHOTOS} photos. Tap to set as primary.
          </Caption>

          <View style={styles.photoGrid}>
            {/* Existing Photos */}
            {photos.map((photo, index) => (
              <View key={photo.id} style={styles.photoWrapper}>
                <Pressable
                  onPress={() => handleSetPrimary(photo.id)}
                  style={({ pressed }) => [
                    styles.photoItem,
                    photo.isPrimary && styles.photoItemPrimary,
                    pressed && styles.photoItemPressed,
                  ]}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  {photo.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Caption style={styles.primaryText}>PRIMARY</Caption>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleDeletePhoto(photo.id)}
                  style={styles.deleteButton}
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
});

export default PhotosScreen;
