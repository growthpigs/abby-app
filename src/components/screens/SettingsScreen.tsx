/**
 * SettingsScreen - App settings and preferences
 *
 * Glass-styled settings page accessible from hamburger menu.
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { Headline, Body, Caption } from '../ui/Typography';

export interface SettingsScreenProps {
  onClose?: () => void;
  onEditProfile?: () => void;
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onSubscription?: () => void;
  onHelp?: () => void;
  onDeleteAccount?: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  description,
  onPress,
  isDestructive,
}) => {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.settingsItemPressed,
      ]}
    >
      <View style={styles.settingsItemIcon}>{icon}</View>
      <View style={styles.settingsItemContent}>
        <Body style={[styles.settingsItemLabel, isDestructive && styles.destructiveText]}>
          {label}
        </Body>
        {description && (
          <Caption style={styles.settingsItemDescription}>{description}</Caption>
        )}
      </View>
      <ChevronRight size={20} stroke="rgba(0, 0, 0, 0.3)" />
    </Pressable>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onClose,
  onEditProfile,
  onNotifications,
  onPrivacy,
  onSubscription,
  onHelp,
  onDeleteAccount,
}) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Caption style={styles.headerTitle}>SETTINGS</Caption>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Body style={styles.closeText}>Done</Body>
          </Pressable>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Account Section */}
          <Caption style={styles.sectionTitle}>ACCOUNT</Caption>
          <View style={styles.section}>
            <SettingsItem
              icon={<User size={22} stroke="rgba(0, 0, 0, 0.7)" />}
              label="Edit Profile"
              description="Name, bio, and preferences"
              onPress={onEditProfile}
            />
            <SettingsItem
              icon={<Bell size={22} stroke="rgba(0, 0, 0, 0.7)" />}
              label="Notifications"
              description="Match alerts, messages"
              onPress={onNotifications}
            />
            <SettingsItem
              icon={<Shield size={22} stroke="rgba(0, 0, 0, 0.7)" />}
              label="Privacy"
              description="Who can see your profile"
              onPress={onPrivacy}
            />
          </View>

          {/* Subscription Section */}
          <Caption style={styles.sectionTitle}>SUBSCRIPTION</Caption>
          <View style={styles.section}>
            <SettingsItem
              icon={<CreditCard size={22} stroke="rgba(0, 0, 0, 0.7)" />}
              label="Manage Subscription"
              description="View plan and billing"
              onPress={onSubscription}
            />
          </View>

          {/* Support Section */}
          <Caption style={styles.sectionTitle}>SUPPORT</Caption>
          <View style={styles.section}>
            <SettingsItem
              icon={<HelpCircle size={22} stroke="rgba(0, 0, 0, 0.7)" />}
              label="Help & Support"
              description="FAQ, contact us"
              onPress={onHelp}
            />
          </View>

          {/* Danger Zone */}
          <Caption style={styles.sectionTitle}>DANGER ZONE</Caption>
          <View style={styles.section}>
            <SettingsItem
              icon={<Trash2 size={22} stroke="rgba(239, 68, 68, 0.8)" />}
              label="Delete Account"
              description="Permanently remove your data"
              onPress={onDeleteAccount}
              isDestructive
            />
          </View>

          {/* Version Info */}
          <Caption style={styles.versionText}>ABBY v1.0.0</Caption>
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
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 12,
    marginTop: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingsItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  settingsItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.85)',
    marginBottom: 2,
  },
  settingsItemDescription: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  destructiveText: {
    color: 'rgba(239, 68, 68, 0.9)',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 32,
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default SettingsScreen;
