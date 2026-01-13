/**
 * DOBScreen - Date of Birth + Age Range
 *
 * Screen 5 in client onboarding spec.
 * - Date of birth input (required)
 * - Desired age range for matches
 *
 * TODO: Replace with proper date picker and range slider
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { Checkbox } from '../ui/Checkbox';

interface DOBScreenProps {
  onNext?: (dob: { month: number; day: number; year: number }, ageRange: { min: number; max: number }) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const DOBScreen: React.FC<DOBScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  // DOB fields
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  // Age range fields
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('65');

  // 18+ confirmation (legal requirement)
  const [confirmed18, setConfirmed18] = useState(false);

  // Refs for focus management
  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const ageMinRef = useRef<TextInput>(null);
  const ageMaxRef = useRef<TextInput>(null);

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(
        { month: parseInt(month, 10), day: parseInt(day, 10), year: parseInt(year, 10) },
        { min: parseInt(ageMin, 10), max: parseInt(ageMax, 10) }
      );
    }
  };

  const handleSecretBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  };

  const handleSecretForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  };

  // Auto-advance on input
  const handleMonthChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(numeric);
    if (numeric.length === 2) {
      dayRef.current?.focus();
    }
  };

  const handleDayChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(numeric);
    if (numeric.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(numeric);
    if (numeric.length === 4) {
      ageMinRef.current?.focus();
    }
  };

  const handleAgeMinChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 2);
    setAgeMin(numeric);
  };

  const handleAgeMaxChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 2);
    setAgeMax(numeric);
  };

  // Validation - always use radix 10 to avoid octal parsing issues (e.g., '08' → 8, not 0)
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  const yearNum = parseInt(year, 10);
  const ageMinNum = parseInt(ageMin, 10);
  const ageMaxNum = parseInt(ageMax, 10);

  // Check if date is valid for the given month/year (handles Feb 30, etc.)
  const isValidCalendarDate = (m: number, d: number, y: number): boolean => {
    if (m < 1 || m > 12 || d < 1) return false;
    const daysInMonth = new Date(y, m, 0).getDate(); // Day 0 of next month = last day of this month
    return d <= daysInMonth;
  };

  const isValidDOB = (
    month.length === 2 &&
    day.length === 2 &&
    year.length === 4 &&
    monthNum >= 1 && monthNum <= 12 &&
    dayNum >= 1 && dayNum <= 31 &&
    yearNum >= 1900 && yearNum <= new Date().getFullYear() - 18 &&
    isValidCalendarDate(monthNum, dayNum, yearNum)
  );

  const isValidAgeRange = (
    ageMinNum >= 18 &&
    ageMaxNum >= ageMinNum &&
    ageMaxNum <= 99
  );

  // All validations must pass including 18+ confirmation
  const isValid = isValidDOB && isValidAgeRange && confirmed18;

  // Calculate age for display
  const calculateAge = () => {
    if (!isValidDOB) return null;
    const today = new Date();
    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.backButton}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          When were you{'\n'}born?
        </Typography>

        {/* DOB inputs - MM/DD/YYYY format */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.inputLabel}>
            Date of birth
          </Typography>
          <View style={styles.dobRow}>
            <View style={styles.dobField}>
              <TextInput
                style={styles.dobInput}
                value={month}
                onChangeText={handleMonthChange}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                autoFocus={true}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
            </View>
            <Typography variant="headline" style={styles.dobSeparator}>/</Typography>
            <View style={styles.dobField}>
              <TextInput
                ref={dayRef}
                style={styles.dobInput}
                value={day}
                onChangeText={handleDayChange}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
            </View>
            <Typography variant="headline" style={styles.dobSeparator}>/</Typography>
            <View style={styles.dobFieldYear}>
              <TextInput
                ref={yearRef}
                style={styles.dobInput}
                value={year}
                onChangeText={handleYearChange}
                placeholder="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
            </View>
          </View>
          {age !== null && (
            <Typography variant="caption" style={styles.ageDisplay}>
              You are {age} years old
            </Typography>
          )}
        </View>

        {/* Age range inputs */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.inputLabel}>
            Desired age range for matches
          </Typography>
          <View style={styles.ageRangeRow}>
            <View style={styles.ageField}>
              <TextInput
                ref={ageMinRef}
                style={styles.ageInput}
                value={ageMin}
                onChangeText={handleAgeMinChange}
                placeholder="18"
                keyboardType="number-pad"
                maxLength={2}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
              <Typography variant="caption" style={styles.ageLabel}>Min</Typography>
            </View>
            <Typography variant="headline" style={styles.ageSeparator}>—</Typography>
            <View style={styles.ageField}>
              <TextInput
                ref={ageMaxRef}
                style={styles.ageInput}
                value={ageMax}
                onChangeText={handleAgeMaxChange}
                placeholder="65"
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={handleNext}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
              <Typography variant="caption" style={styles.ageLabel}>Max</Typography>
            </View>
          </View>
        </View>

        {/* 18+ Age Confirmation (Legal Requirement) */}
        <View style={styles.confirmationGroup}>
          <Checkbox
            checked={confirmed18}
            onChange={setConfirmed18}
            label="I confirm I am at least 18 years old"
            description="Required to use this app"
            testID="age-confirmation-checkbox"
            accessibilityLabel="Confirm you are at least 18 years old"
          />
        </View>

      </View>

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!isValid}
          variant="primary"
        >
          Continue
        </GlassButton>
      </View>

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 48,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobField: {
    width: 60,
  },
  dobFieldYear: {
    width: 80,
  },
  dobInput: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    textAlign: 'center',
  },
  dobSeparator: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  ageDisplay: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageField: {
    alignItems: 'center',
  },
  ageInput: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    textAlign: 'center',
  },
  ageLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  ageSeparator: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 16,
  },
  confirmationGroup: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
});

export default DOBScreen;
