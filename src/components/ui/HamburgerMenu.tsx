/**
 * HamburgerMenu - Subtle overlay menu for app navigation
 *
 * FIXES APPLIED (2026-01-16):
 * 1. REMOVED BlurView - iOS native blur intercepts touches even with pointerEvents
 * 2. Using solid semi-transparent background instead
 * 3. Menu items use TouchableOpacity for reliable iOS touch handling
 * 4. Backdrop only covers area OUTSIDE menu panel
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
// BlurView REMOVED - causes touch interception on iOS
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
    // Execute action immediately
    if (action) {
      if (__DEV__) console.log(`[HamburgerMenu] ➡️ Calling action for: ${actionName}`);
      action();
    }
  }, [slideAnim, fadeAnim]);

  return (
    <>
      {/* Hamburger Icon Button - always visible */}
      <TouchableOpacity
        onPress={openMenu}
        style={styles.hamburgerButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Menu size={28} stroke="rgba(255, 255, 255, 0.95)" strokeWidth={3} />
      </TouchableOpacity>

      {/* Overlay - NO MODAL */}
      {isOpen && (
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Backdrop - ONLY covers area outside menu (right side) */}
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
            {/* Solid background instead of BlurView - BlurView intercepts touches on iOS */}
            <View style={styles.menuContent}>
              {/* Header */}
              <View style={styles.menuHeader}>
                <Caption style={styles.menuTitle}>MENU</Caption>
                <TouchableOpacity
                  onPress={closeMenu}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} stroke="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                {/* My Profile */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Profile', onProfilePress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <User size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>My Profile</Body>
                </TouchableOpacity>

                {/* My Photos */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Photos', onPhotosPress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <Camera size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>My Photos</Body>
                </TouchableOpacity>

                {/* Matches */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Matches', onMatchesPress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <Heart size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Interested in You</Body>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Settings', onSettingsPress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <Settings size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Settings</Body>
                </TouchableOpacity>

                {/* Certification */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Certification', onCertificationPress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <ShieldCheck size={22} stroke="#FFFFFF" />
                  <Body style={styles.menuItemText}>Certification</Body>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Log Out */}
                <TouchableOpacity
                  onPress={() => handleMenuItemPress('Logout', onLogoutPress)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <LogOut size={22} stroke="rgba(250, 128, 114, 0.9)" />
                  <Body style={[styles.menuItemText, styles.logoutText]}>
                    Log Out
                  </Body>
                </TouchableOpacity>
              </View>
            </View>
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

  // Full-screen overlay container
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20000,
  },

  // Backdrop ONLY covers the right side (outside menu)
  backdrop: {
    position: 'absolute',
    top: 0,
    left: MENU_WIDTH, // Start AFTER menu panel
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
    backgroundColor: 'rgba(30, 30, 40, 0.95)', // Solid dark background - no blur
  },

  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuTitle: {
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(255, 255, 255, 0.5)', // Light text for dark background
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  menuItemText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  logoutText: {
    color: 'rgba(250, 128, 114, 0.9)',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 8,
  },
});

export default HamburgerMenu;
