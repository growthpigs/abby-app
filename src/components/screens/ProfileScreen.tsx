/**
 * ProfileScreen - Edit Profile Overlay
 *
 * Allows users to view and edit their profile data after onboarding.
 * Uses same overlay pattern as SettingsScreen.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { User, Heart, Users, Cigarette, MapPin } from 'lucide-react-native';
import { Headline, Body, Caption } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { TokenManager } from '../../services/TokenManager';
import { secureFetchJSON } from '../../utils/secureFetch';
import { API_CONFIG } from '../../config';

export interface ProfileScreenProps {
  onClose?: () => void;
}

interface ProfileSectionProps {
  icon: React.ReactNode;
  title: string;
  value: string | null;
  onPress?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  icon,
  title,
  value,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.section,
        pressed && styles.sectionPressed,
      ]}
      disabled={!onPress}
    >
      <View style={styles.sectionIcon}>{icon}</View>
      <View style={styles.sectionContent}>
        <Caption style={styles.sectionTitle}>{title}</Caption>
        <Body style={styles.sectionValue}>{value || 'Not set'}</Body>
      </View>
      {onPress && (
        <Body style={styles.editIndicator}>Edit</Body>
      )}
    </Pressable>
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onClose,
}) => {
  const store = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);

  // Local state for editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const profilePayload = store.getProfilePayload();
      const token = await TokenManager.getToken();

      if (token && Object.keys(profilePayload).length > 0) {
        await secureFetchJSON(`${API_CONFIG.API_URL}/profile/public`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        });

        if (__DEV__) console.log('[ProfileScreen] Profile saved successfully');

        Alert.alert('Success', 'Your profile has been updated.');
        onClose?.();
      }
    } catch (error) {
      if (__DEV__) console.error('[ProfileScreen] Save failed:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [store, onClose]);

  const startEditing = (field: string, currentValue: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const saveField = () => {
    if (!editingField) return;

    switch (editingField) {
      case 'fullName':
        store.setFirstName(editValue);
        break;
      case 'nickname':
        store.setNickname(editValue);
        break;
    }

    setEditingField(null);
    setEditValue('');
  };

  // Format display values
  const formatGender = (gender: string | null) => {
    if (!gender) return null;
    return gender.charAt(0).toUpperCase() + gender.slice(1).replace(/_/g, ' ');
  };

  const formatPreference = (pref: string | null) => {
    if (!pref) return null;
    if (pref === 'everyone') return 'Everyone';
    if (pref === 'men') return 'Men';
    if (pref === 'women') return 'Women';
    return pref.charAt(0).toUpperCase() + pref.slice(1);
  };

  const formatRelationship = (type: string | null) => {
    if (!type) return null;
    return type.replace(/_/g, ' ').split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatSmoking = (me: string | null, partner: string | null) => {
    if (!me && !partner) return null;
    const parts = [];
    if (me) parts.push(`Me: ${me}`);
    if (partner) parts.push(`Partner: ${partner}`);
    return parts.join(' | ');
  };

  const formatLocation = () => {
    const loc = store.location;
    if (!loc) return null;
    if (loc.type === 'zip') return `ZIP: ${loc.value}`;
    if (loc.type === 'gps') {
      const gps = loc.value as { lat: number; lng: number };
      return `GPS: ${gps.lat.toFixed(2)}, ${gps.lng.toFixed(2)}`;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Caption style={styles.headerTitle}>MY PROFILE</Caption>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Body style={styles.closeText}>Done</Body>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Edit Modal */}
          {editingField && (
            <View style={styles.editModal}>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                placeholder={`Enter ${editingField}`}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                maxLength={100}
              />
              <View style={styles.editButtons}>
                <Pressable
                  onPress={() => setEditingField(null)}
                  style={styles.cancelButton}
                >
                  <Body style={styles.cancelText}>Cancel</Body>
                </Pressable>
                <Pressable onPress={saveField} style={styles.saveFieldButton}>
                  <Body style={styles.saveFieldText}>Save</Body>
                </Pressable>
              </View>
            </View>
          )}

          {/* Profile Sections */}
          <Headline style={styles.sectionHeading}>Basic Info</Headline>

          <ProfileSection
            icon={<User size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Full Name"
            value={store.firstName && store.familyName ? `${store.firstName} ${store.familyName}` : store.firstName || store.familyName || ''}
            onPress={() => startEditing('fullName', store.firstName || '')}
          />

          <ProfileSection
            icon={<User size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Nickname"
            value={store.nickname}
            onPress={() => startEditing('nickname', store.nickname)}
          />

          <ProfileSection
            icon={<User size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Gender"
            value={formatGender(store.gender)}
          />

          <Headline style={styles.sectionHeading}>Preferences</Headline>

          <ProfileSection
            icon={<Heart size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Looking For"
            value={formatPreference(store.datingPreference)}
          />

          <ProfileSection
            icon={<Users size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Relationship Type"
            value={formatRelationship(store.relationshipType)}
          />

          <ProfileSection
            icon={<Cigarette size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Smoking"
            value={formatSmoking(store.smokingMe, store.smokingPartner)}
          />

          <ProfileSection
            icon={<MapPin size={20} stroke="rgba(0, 0, 0, 0.6)" />}
            title="Location"
            value={formatLocation()}
          />

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <GlassButton
              onPress={handleSave}
              disabled={isSaving}
              variant="primary"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeading: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.85)',
    marginTop: 16,
    marginBottom: 12,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  sectionPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  editIndicator: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  editModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  editInput: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 16,
    color: 'rgba(0, 0, 0, 0.85)',
    letterSpacing: 0,
    textAlign: 'left',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
  },
  saveFieldButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  saveFieldText: {
    color: 'white',
    fontWeight: '600',
  },
  saveContainer: {
    marginTop: 32,
  },
});

export default ProfileScreen;
