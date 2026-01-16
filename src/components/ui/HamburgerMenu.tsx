/**
 * HamburgerMenu - Subtle overlay menu for app navigation
 *
 * FIXED: Removed Modal to fix iOS touch handling issues.
 * Uses absolutely positioned View instead - menu items are in normal flow.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Menu, X, Camera, Heart, Settings, LogOut, User, ShieldCheck } from 'lucide-react-native';
import { Body, Caption } from './Typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
  const [fadeAnim] = useState(new Animated.Value(0));

  const openMenu = useCallback(() => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  }, [slideAnim, fadeAnim]);

  const handleMenuItemPress = useCallback((actionName: string, action?: () => void) => {
    if (__DEV__) console.log(`[HamburgerMenu] 👆 Item pressed: ${actionName}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Close menu first
    setIsOpen(false);
    slideAnim.setValue(-MENU_WIDTH);
    fadeAnim.setValue(0);
    // Execute action
    if (action) {
      if (__DEV__) console.log(`[HamburgerMenu] ➡️ Calling action for: ${actionName}`);
      action();
    }
  }, [slideAnim, fadeAnim]);

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

      {/* Overlay - NO MODAL, just absolutely positioned Views */}
      {isOpen && (
        <View style={styles.overlay}>
          {/* Backdrop - TouchableWithoutFeedback for reliable tap */}
          <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: fadeAnim }
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Menu Panel - slides in from left */}
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

              {/* Menu Items - normal flow, NOT absolute positioned */}
              <View style={styles.menuItems}>
                {/* My Profile */}
                <Pressable
                  onPress={() => handleMenuItemPress('Profile', onProfilePress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <User size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>My Profile</Body>
                </Pressable>

                {/* My Photos */}
                <Pressable
                  onPress={() => handleMenuItemPress('Photos', onPhotosPress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <Camera size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>My Photos</Body>
                </Pressable>

                {/* Matches */}
                <Pressable
                  onPress={() => handleMenuItemPress('Matches', onMatchesPress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <Heart size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Interested in You</Body>
                </Pressable>

                {/* Settings */}
                <Pressable
                  onPress={() => handleMenuItemPress('Settings', onSettingsPress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <Settings size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Settings</Body>
                </Pressable>

                {/* Certification */}
                <Pressable
                  onPress={() => handleMenuItemPress('Certification', onCertificationPress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <ShieldCheck size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Certification</Body>
                </Pressable>

                <View style={styles.divider} />

                {/* Log Out */}
                <Pressable
                  onPress={() => handleMenuItemPress('Logout', onLogoutPress)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <LogOut size={22} stroke="rgba(250, 128, 114, 0.9)" />
                  <Body style={[styles.menuItemText, styles.logoutText]}>
                    Log Out
                  </Body>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      )}
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
    zIndex: 10001,
  },
  hamburgerButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  // Full-screen overlay container (replaces Modal)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20000, // Above everything
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
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

  // Menu items in NORMAL FLOW (not absolute) - key fix!
  menuItems: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 52,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.8,
  },
  menuItemText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  logoutText: {
    color: 'rgba(250, 128, 114, 0.9)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 8,
  },
});

export default HamburgerMenu;
