/**
 * ProfileScreen - Edit Profile Overlay
 *
 * Allows users to view and edit their profile data after onboarding.
 * Uses same overlay pattern as SettingsScreen.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { User, Heart, Users, Cigarette, MapPin, X } from 'lucide-react-native';
import { Headline, Body, Caption } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { TokenManager } from '../../services/TokenManager';
import { secureFetchJSON } from '../../utils/secureFetch';
import { API_CONFIG } from '../../config';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { sharedStyles, LAYOUT, TYPOGRAPHY, COLORS } from '../../constants/onboardingLayout';
import { api } from '../../services/api';
import { ONBOARDING_QUESTION_IDS } from '../../constants/onboardingQuestions';

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
  const layout = useResponsiveLayout();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (__DEV__) console.log('[ProfileScreen] Fetching user data from API...');

        // Fetch profile data from /me endpoint
        const profile = await api.getMe();
        if (profile) {
          if (profile.firstName) store.setFirstName(profile.firstName);
          if (profile.displayName) store.setNickname(profile.displayName);
          if (profile.gender) store.setGender(profile.gender);
          if (profile.dateOfBirth) {
            store.setDateOfBirth(new Date(profile.dateOfBirth));
          }
          if (profile.location) {
            store.setLocation({
              type: 'gps',
              value: {
                lat: profile.location.latitude,
                lng: profile.location.longitude,
              },
            });
          }
          if (__DEV__) console.log('[ProfileScreen] Profile loaded:', profile.displayName);
        }

        // Fetch answers from /answers endpoint
        const answers = await api.getAnswers();
        if (answers && answers.length > 0) {
          if (__DEV__) console.log('[ProfileScreen] Got', answers.length, 'answers from API');

          answers.forEach((answer) => {
            const value = answer.answer?.selected || answer.answer?.text;
            if (!value) return;

            switch (answer.questionId) {
              case ONBOARDING_QUESTION_IDS.DATING_PREFERENCE:
                store.setDatingPreference(Array.isArray(value) ? value[0] : value);
                break;
              case ONBOARDING_QUESTION_IDS.ETHNICITY:
                store.setEthnicity(Array.isArray(value) ? value[0] : value);
                break;
              case ONBOARDING_QUESTION_IDS.ETHNICITY_PREFERENCES:
                if (Array.isArray(value)) {
                  store.setEthnicityPreferences(value);
                }
                break;
              case ONBOARDING_QUESTION_IDS.RELATIONSHIP_TYPE:
                store.setRelationshipType(Array.isArray(value) ? value[0] : value);
                break;
              case ONBOARDING_QUESTION_IDS.SMOKING:
                // Smoking answer is stored as JSON string
                try {
                  const smokingData = typeof value === 'string' ? JSON.parse(value) : value;
                  if (smokingData.user) store.setSmokingMe(smokingData.user);
                  if (smokingData.partner_preference) store.setSmokingPartner(smokingData.partner_preference);
                } catch {
                  // If not JSON, treat as simple value
                  if (typeof value === 'string') store.setSmokingMe(value);
                }
                break;
            }
          });
        }
      } catch (error) {
        // Expected in demo mode - no token available
        // Screen will show local onboarding data instead
        if (__DEV__) console.log('[ProfileScreen] Using local data (no API token - demo mode)');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 40 }]}>
          <Caption style={styles.headerTitle}>MY PROFILE</Caption>
        </View>

        {/* Close button - absolute positioned using shared design system */}
        <Pressable
          onPress={onClose}
          style={sharedStyles.closeButton}
          hitSlop={10}
        >
          <X size={24} stroke={COLORS.charcoal.medium} />
        </Pressable>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingVertical: LAYOUT.spacing.large,
              paddingHorizontal: LAYOUT.content.paddingHorizontal,
              paddingBottom: LAYOUT.content.paddingBottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.blue.primary} />
              <Body style={styles.loadingText}>Loading your profile...</Body>
            </View>
          ) : (
            <>
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
          <Headline style={[styles.sectionHeading, { fontSize: TYPOGRAPHY.headline.fontSize, marginTop: LAYOUT.spacing.large, marginBottom: LAYOUT.spacing.default }]}>Basic Info</Headline>

          <ProfileSection
            icon={<User size={20} stroke="#5A5A5A" />}
            title="Full Name"
            value={store.firstName && store.familyName ? `${store.firstName} ${store.familyName}` : store.firstName || store.familyName || ''}
            onPress={() => startEditing('fullName', store.firstName || '')}
          />

          <ProfileSection
            icon={<User size={20} stroke="#5A5A5A" />}
            title="Nickname"
            value={store.nickname}
            onPress={() => startEditing('nickname', store.nickname)}
          />

          <ProfileSection
            icon={<User size={20} stroke="#5A5A5A" />}
            title="Gender"
            value={formatGender(store.gender)}
          />

          <Headline style={[styles.sectionHeading, { fontSize: TYPOGRAPHY.headline.fontSize, marginTop: LAYOUT.spacing.large, marginBottom: LAYOUT.spacing.default }]}>Preferences</Headline>

          <ProfileSection
            icon={<Heart size={20} stroke="#5A5A5A" />}
            title="Looking For"
            value={formatPreference(store.datingPreference)}
          />

          <ProfileSection
            icon={<Users size={20} stroke="#5A5A5A" />}
            title="Relationship Type"
            value={formatRelationship(store.relationshipType)}
          />

          <ProfileSection
            icon={<Cigarette size={20} stroke="#5A5A5A" />}
            title="Smoking"
            value={formatSmoking(store.smokingMe, store.smokingPartner)}
          />

          <ProfileSection
            icon={<MapPin size={20} stroke="#5A5A5A" />}
            title="Location"
            value={formatLocation()}
          />

          {/* Save Button */}
          <View style={[styles.saveContainer, { marginTop: LAYOUT.spacing.xl }]}>
            <GlassButton
              onPress={handleSave}
              disabled={isSaving}
              variant="primary"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
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
    // paddingTop is set dynamically via LAYOUT.backArrow.top
    paddingBottom: LAYOUT.spacing.default,
    paddingHorizontal: LAYOUT.content.paddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white[10],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sectionLabel.fontSize,
    letterSpacing: TYPOGRAPHY.sectionLabel.letterSpacing,
    color: '#5A5A5A', // Medium GRAY for readability on pale blur
    textTransform: 'uppercase',
  },
  // closeButton removed - using sharedStyles.closeButton instead
  scrollView: {
    flex: 1,
  },
  content: {
    // paddingVertical, paddingHorizontal, paddingBottom set dynamically via layout
  },
  sectionHeading: {
    // fontSize, marginTop, marginBottom set dynamically via LAYOUT/TYPOGRAPHY constants
    color: '#3A3A3A', // Dark GRAY for headings on pale blur
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.default,
    backgroundColor: COLORS.white[10],
    borderRadius: 12,
    marginBottom: LAYOUT.spacing.small,
    borderWidth: 1,
    borderColor: COLORS.white[10],
  },
  sectionPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.blue.selected,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white[10],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LAYOUT.spacing.medium,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    color: '#5A5A5A', // Medium GRAY for labels on pale blur
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: LAYOUT.spacing.default,
    color: '#3A3A3A', // Dark GRAY for values on pale blur
  },
  editIndicator: {
    fontSize: 14,
    color: COLORS.blue.primary,
    fontWeight: '500',
  },
  editModal: {
    backgroundColor: COLORS.white[95],
    borderRadius: 16,
    padding: LAYOUT.spacing.large,
    marginBottom: LAYOUT.spacing.large,
    borderWidth: 1,
    borderColor: COLORS.blue.selected,
  },
  editInput: {
    fontSize: TYPOGRAPHY.button.fontSize,
    paddingVertical: LAYOUT.spacing.medium,
    paddingHorizontal: LAYOUT.spacing.default,
    backgroundColor: COLORS.white[10],
    borderRadius: 8,
    marginBottom: LAYOUT.spacing.default,
    color: COLORS.charcoal.dark,
    letterSpacing: 0,
    textAlign: 'left',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: LAYOUT.spacing.medium,
  },
  cancelButton: {
    paddingVertical: LAYOUT.spacing.small,
    paddingHorizontal: LAYOUT.spacing.default,
  },
  cancelText: {
    color: COLORS.charcoal.light,
    fontWeight: '500',
  },
  saveFieldButton: {
    paddingVertical: LAYOUT.spacing.small,
    paddingHorizontal: LAYOUT.spacing.default,
    backgroundColor: COLORS.blue.primary,
    borderRadius: 8,
  },
  saveFieldText: {
    color: COLORS.white.full,
    fontWeight: '600',
  },
  saveContainer: {
    // marginTop set dynamically via layout
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.xl * 2,
  },
  loadingText: {
    marginTop: LAYOUT.spacing.medium,
    color: '#5A5A5A',
    fontSize: TYPOGRAPHY.body.fontSize,
  },
});

export default ProfileScreen;
