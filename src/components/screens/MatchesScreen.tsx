/**
 * MatchesScreen - View people interested in you
 *
 * Displays match candidates from /v1/matches/candidates API.
 * MVP shows placeholder; V2 integrates with real matching API.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, Users } from 'lucide-react-native';
import { Headline, Body, Caption } from '../ui/Typography';

export interface MatchesScreenProps {
  onClose?: () => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onClose,
}) => {
  // TODO: Integrate with /v1/matches/candidates API
  const hasMatches = false; // Placeholder for MVP

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Caption style={styles.headerTitle}>INTERESTED IN YOU</Caption>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Body style={styles.closeText}>Done</Body>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {hasMatches ? (
            // TODO: Map through matches from API
            <Body>Matches will appear here</Body>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Heart size={48} stroke="rgba(0, 0, 0, 0.2)" />
              </View>
              <Headline style={styles.emptyTitle}>
                No matches yet
              </Headline>
              <Body style={styles.emptyText}>
                Complete your interview with Abby to start getting matched with compatible people.
              </Body>
            </View>
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
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});

export default MatchesScreen;
