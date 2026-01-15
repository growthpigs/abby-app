/**
 * HamburgerMenu - Subtle overlay menu for app navigation
 *
 * Top-left positioned, white/subtle hamburger icon.
 * Opens a glass-styled slide-out menu.
 *
 * Menu items (based on API endpoints):
 * - My Photos (/v1/photos/*)
 * - Matches (/v1/matches/candidates)
 * - Settings (input mode only per settings-spec.md)
 * - Log Out
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Menu, X, Camera, Heart, Settings, LogOut, User, ShieldCheck } from 'lucide-react-native';
import { Body, Caption } from './Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

export interface HamburgerMenuProps {
  onProfilePress?: () => void;
  onPhotosPress?: () => void;
  onMatchesPress?: () => void;
  onCertificationPress?: () => void;
  onSettingsPress?: () => void;
  onLogoutPress?: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onProfilePress,
  onPhotosPress,
  onMatchesPress,
  onCertificationPress,
  onSettingsPress,
  onLogoutPress,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));

  const openMenu = useCallback(() => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const closeMenu = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  }, [slideAnim]);

  const handleMenuItemPress = useCallback((action?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Close menu IMMEDIATELY first (no animation), then execute action
    // This prevents the Modal from blocking overlay screens like CertificationScreen
    setIsOpen(false);
    slideAnim.setValue(-MENU_WIDTH);
    // Execute action after modal is dismissed
    if (action) {
      // Small delay to ensure modal is fully unmounted
      setTimeout(() => action(), 50);
    }
  }, [slideAnim]);

  return (
    <>
      {/* Hamburger Icon Button - always visible */}
      <Pressable
        onPress={openMenu}
        style={({ pressed }) => [
          styles.hamburgerButton,
          pressed && styles.hamburgerButtonPressed,
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Menu size={28} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={3} />
      </Pressable>

      {/* Slide-out Menu Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View style={styles.backdropInner} />
        </Pressable>

        {/* Menu Panel */}
        <Animated.View
          style={[
            styles.menuPanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.menuContent}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <Caption style={styles.menuTitle}>MENU</Caption>
              <Pressable
                onPress={closeMenu}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} stroke="rgba(0, 0, 0, 0.6)" />
              </Pressable>
            </View>

            {/* Menu Items - pointerEvents box-none allows touches to pass through container */}
            <View style={styles.menuItems} pointerEvents="box-none">
              {/* My Profile - /v1/me */}
              <Pressable
                onPress={() => handleMenuItemPress(onProfilePress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <User size={22} stroke="#FFFFFF" />
                <Body style={styles.menuItemText}>My Profile</Body>
              </Pressable>

              {/* My Photos - /v1/photos/* */}
              <Pressable
                onPress={() => handleMenuItemPress(onPhotosPress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Camera size={22} stroke="#FFFFFF" />
                <Body style={styles.menuItemText}>My Photos</Body>
              </Pressable>

              {/* Matches - /v1/matches/candidates */}
              <Pressable
                onPress={() => handleMenuItemPress(onMatchesPress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Heart size={22} stroke="#FFFFFF" />
                <Body style={styles.menuItemText}>Interested in You</Body>
              </Pressable>

              {/* Settings - Input mode only */}
              <Pressable
                onPress={() => handleMenuItemPress(onSettingsPress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Settings size={22} stroke="#FFFFFF" />
                <Body style={styles.menuItemText}>Settings</Body>
              </Pressable>

              {/* Certification - /v1/verification */}
              <Pressable
                onPress={() => handleMenuItemPress(onCertificationPress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <ShieldCheck size={22} stroke="#FFFFFF" />
                <Body style={styles.menuItemText}>Certification</Body>
              </Pressable>

              <View style={styles.divider} />

              {/* Log Out */}
              <Pressable
                onPress={() => handleMenuItemPress(onLogoutPress)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <LogOut size={22} stroke="rgba(239, 68, 68, 0.8)" />
                <Body style={[styles.menuItemText, styles.logoutText]}>
                  Log Out
                </Body>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001, // Above secret triggers (9999)
  },
  hamburgerButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropInner: {
    flex: 1,
  },

  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    // No shadows - clean design
    elevation: 0,
  },
  menuContent: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 24,
  },

  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  menuTitle: {
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItems: {
    gap: 2, // Reduced gap since items have more padding now
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16, // Increased for better touch target (was 12)
    paddingHorizontal: 12, // Increased for better touch target (was 8)
    borderRadius: 10,
    minHeight: 52, // Ensure minimum 52px touch target
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemText: {
    fontSize: 17,
    color: '#FFFFFF', // White
  },
  logoutText: {
    color: 'rgba(239, 68, 68, 0.9)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 8,
  },
});

export default HamburgerMenu;
