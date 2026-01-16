/**
 * MatchesScreen - View people interested in you
 *
 * Displays match candidates from /v1/matches/candidates API.
 * Shows loading, empty, and error states appropriately.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, MessageCircle, X, Check } from 'lucide-react-native';
import { Headline, Body, Caption } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { checkIsDemoMode } from '../../hooks/useIsDemoMode';
import { secureFetchJSON } from '../../utils/secureFetch';
import { TokenManager } from '../../services/TokenManager';
import { API_CONFIG } from '../../config';

// Demo data for when no auth token (demo mode)
// Note: compatibilityScore is 0-1 decimal (API format), displayed as percentage
const DEMO_MATCHES: MatchCandidate[] = [
  {
    id: 'demo-1',
    name: 'Sarah',
    age: 28,
    bio: 'Coffee enthusiast, book lover, and weekend hiker. Looking for someone who appreciates deep conversations and spontaneous adventures.',
    compatibilityScore: 0.94,
  },
  {
    id: 'demo-2',
    name: 'Emma',
    age: 31,
    bio: 'Creative director by day, amateur chef by night. I believe the best relationships start with great food and honest conversation.',
    compatibilityScore: 0.89,
  },
  {
    id: 'demo-3',
    name: 'Jessica',
    age: 26,
    bio: 'Yoga instructor with a passion for travel. Currently planning my next adventure and hoping to find someone to share it with.',
    compatibilityScore: 0.85,
  },
];

// Internal normalized interface (what our UI expects)
interface MatchCandidate {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  compatibilityScore?: number;  // Normalized to 0-1 range
  photoUrl?: string;
}

// Raw API response interface (snake_case from backend)
interface RawMatchCandidate {
  user_id: string;
  display_name: string;
  city?: string;
  age?: number;
  short_bio?: string;
  compatibility_score: number;
  photos?: string[];
}

/**
 * Normalize compatibility score to 0-1 range
 * Handles various API formats: 0-1, 0-100, and edge cases
 */
const normalizeScore = (rawScore: number | undefined | null): number => {
  // Handle undefined/null/NaN
  if (rawScore == null || Number.isNaN(rawScore)) {
    if (__DEV__) console.warn('[MatchesScreen] Invalid score:', rawScore);
    return 0;
  }

  // Handle negative scores
  if (rawScore < 0) {
    if (__DEV__) console.warn('[MatchesScreen] Negative score clamped:', rawScore);
    return 0;
  }

  // Normalize based on value range
  let normalized: number;
  if (rawScore <= 1) {
    // Already in 0-1 range
    normalized = rawScore;
  } else if (rawScore <= 100) {
    // Assume 0-100 scale
    normalized = rawScore / 100;
  } else {
    // Assume 0-1000 or higher - normalize and clamp
    if (__DEV__) console.warn('[MatchesScreen] Unusual score range:', rawScore);
    normalized = Math.min(rawScore / 100, 1);
  }

  // Final clamp to ensure valid range
  return Math.max(0, Math.min(1, normalized));
};

/**
 * Validate and sanitize age value
 * Returns undefined for invalid ages (allows UI to handle gracefully)
 */
const sanitizeAge = (age: number | undefined | null): number | undefined => {
  if (age == null || Number.isNaN(age)) return undefined;
  if (age <= 0 || age > 150) return undefined; // Sanity bounds
  return Math.floor(age); // Ensure integer
};

/**
 * Transform raw API response to our internal format
 * Handles: snake_case → camelCase, score normalization, photo array → single URL
 */
const transformCandidate = (raw: RawMatchCandidate): MatchCandidate => {
  return {
    id: raw.user_id,
    name: raw.display_name || 'Unknown',
    age: sanitizeAge(raw.age),
    bio: raw.short_bio,
    compatibilityScore: normalizeScore(raw.compatibility_score),
    photoUrl: raw.photos?.[0],
  };
};

export interface MatchesScreenProps {
  onClose?: () => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onClose,
}) => {
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [isActioning, setIsActioning] = useState(false); // Prevent double-tap on like/pass

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);

      // Use centralized demo mode detection (single source of truth)
      const isDemoMode = await checkIsDemoMode();
      if (isDemoMode) {
        if (__DEV__) console.log('[MatchesScreen] Demo mode - using mock data');
        setMatches(DEMO_MATCHES);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      // Authenticated mode - fetch from API
      const token = await TokenManager.getToken();
      const response = await secureFetchJSON<{ candidates: RawMatchCandidate[] }>(
        `${API_CONFIG.API_URL}/matches/candidates`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Transform raw API response to our internal format
      const transformedCandidates = (response.candidates || []).map(transformCandidate);
      setMatches(transformedCandidates);
    } catch (err) {
      if (__DEV__) console.log('[MatchesScreen] Fetch error:', err);
      // Gracefully handle - API might not be ready yet
      setError('Unable to load matches. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [fetchMatches]);

  const handleSelectMatch = useCallback((match: MatchCandidate) => {
    setPhotoLoadFailed(false);  // Reset on new selection
    setSelectedMatch(match);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  /**
   * Like/Accept a match candidate
   * POST /v1/matches/{userId}/like
   */
  const handleLike = useCallback(async (userId: string) => {
    if (isActioning) return; // Prevent double-tap
    if (!userId) {
      if (__DEV__) console.error('[MatchesScreen] handleLike called with empty userId');
      return;
    }
    setIsActioning(true);

    try {
      const isDemoMode = await checkIsDemoMode();
      if (isDemoMode) {
        if (__DEV__) console.log('[MatchesScreen] Demo mode - simulating like');
        // Remove from list and show success
        setMatches(prev => prev.filter(m => m.id !== userId));
        setSelectedMatch(null);
        return;
      }

      const token = await TokenManager.getToken();
      await secureFetchJSON(`${API_CONFIG.API_URL}/matches/${userId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) console.log('[MatchesScreen] Liked user:', userId);
      // Remove from candidates, they're now a match
      setMatches(prev => prev.filter(m => m.id !== userId));
      setSelectedMatch(null);
    } catch (err) {
      if (__DEV__) console.error('[MatchesScreen] Like failed:', err);
      setError('Failed to like. Please try again.');
    } finally {
      setIsActioning(false);
    }
  }, [isActioning]);

  /**
   * Pass/Reject a match candidate
   * POST /v1/matches/{userId}/pass
   */
  const handlePass = useCallback(async (userId: string) => {
    if (isActioning) return; // Prevent double-tap
    if (!userId) {
      if (__DEV__) console.error('[MatchesScreen] handlePass called with empty userId');
      return;
    }
    setIsActioning(true);

    try {
      const isDemoMode = await checkIsDemoMode();
      if (isDemoMode) {
        if (__DEV__) console.log('[MatchesScreen] Demo mode - simulating pass');
        setMatches(prev => prev.filter(m => m.id !== userId));
        setSelectedMatch(null);
        return;
      }

      const token = await TokenManager.getToken();
      await secureFetchJSON(`${API_CONFIG.API_URL}/matches/${userId}/pass`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) console.log('[MatchesScreen] Passed on user:', userId);
      setMatches(prev => prev.filter(m => m.id !== userId));
      setSelectedMatch(null);
    } catch (err) {
      if (__DEV__) console.error('[MatchesScreen] Pass failed:', err);
      setError('Failed to pass. Please try again.');
    } finally {
      setIsActioning(false);
    }
  }, [isActioning]);

  const hasMatches = matches.length > 0;

  // Detail View
  if (selectedMatch) {
    return (
      <View style={styles.container}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* Detail Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBackToList} style={styles.backButton}>
              <ChevronLeft size={24} stroke="rgba(0, 0, 0, 0.7)" />
              <Body style={styles.backText}>Back</Body>
            </Pressable>
          </View>

          {/* Close button - absolute positioned */}
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={10}
          >
            <X size={24} stroke="rgba(90, 90, 90, 0.9)" />
          </Pressable>

          {/* Detail Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.detailContainer}>
            {/* Profile Photo/Avatar */}
            <View style={styles.detailAvatar}>
              {selectedMatch.photoUrl && !photoLoadFailed ? (
                <Image
                  source={{ uri: selectedMatch.photoUrl }}
                  style={styles.detailPhotoImage}
                  resizeMode="cover"
                  onError={() => setPhotoLoadFailed(true)}
                />
              ) : (
                <Heart size={64} stroke="#E11D48" fill="#E11D48" />
              )}
            </View>

            {/* Name and Age */}
            <Headline style={styles.detailName}>
              {selectedMatch.name}{selectedMatch.age ? `, ${selectedMatch.age}` : ''}
            </Headline>

            {/* Match Score */}
            {selectedMatch.compatibilityScore !== undefined && (
              <View style={styles.detailScoreBadge}>
                <Heart size={16} stroke="#E11D48" fill="#E11D48" />
                <Body style={styles.detailScoreText}>
                  {Math.round(selectedMatch.compatibilityScore * 100)}% compatibility
                </Body>
              </View>
            )}

            {/* Full Bio */}
            {selectedMatch.bio && (
              <View style={styles.detailSection}>
                <Caption style={styles.detailSectionTitle}>ABOUT</Caption>
                <Body style={styles.detailBio}>{selectedMatch.bio}</Body>
              </View>
            )}

            {/* Action Buttons - Like/Pass (Elegant glass style) */}
            <View style={styles.detailActions}>
              <Pressable
                onPress={() => handlePass(selectedMatch.id)}
                disabled={isActioning}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.passButton,
                  pressed && styles.actionButtonPressed,
                  isActioning && styles.actionButtonDisabled,
                ]}
              >
                <X size={32} stroke={isActioning ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)'} strokeWidth={2} />
              </Pressable>

              <Pressable
                onPress={() => handleLike(selectedMatch.id)}
                disabled={isActioning}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.likeButton,
                  pressed && styles.actionButtonPressed,
                  isActioning && styles.actionButtonDisabled,
                ]}
              >
                <Heart size={32} stroke="#fff" fill={isActioning ? 'rgba(255, 255, 255, 0.3)' : '#fff'} />
              </Pressable>
            </View>
          </ScrollView>
        </BlurView>
      </View>
    );
  }

  // List View
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 100 }]}>
          <Caption style={styles.headerTitle}>INTERESTED IN YOU</Caption>
        </View>

        {/* Close button - absolute positioned */}
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={10}
        >
          <X size={24} stroke="rgba(90, 90, 90, 0.9)" />
        </Pressable>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="rgba(0, 0, 0, 0.5)"
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#E11D48" />
              <Body style={styles.loadingText}>Finding your matches...</Body>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <View style={styles.errorIcon}>
                <AlertCircle size={48} stroke="#DC2626" />
              </View>
              <Headline style={styles.errorTitle}>Oops!</Headline>
              <Body style={styles.errorText}>{error}</Body>
              <GlassButton
                onPress={handleRefresh}
                variant="secondary"
                style={styles.retryButton}
              >
                <View style={styles.retryContent}>
                  <RefreshCw size={18} stroke="rgba(0, 0, 0, 0.7)" />
                  <Body style={styles.retryText}>Try Again</Body>
                </View>
              </GlassButton>
            </View>
          ) : hasMatches ? (
            <View style={styles.matchesList}>
              {matches.map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() => handleSelectMatch(match)}
                  style={({ pressed }) => [
                    styles.matchCard,
                    pressed && styles.matchCardPressed,
                  ]}
                >
                  <View style={styles.matchAvatar}>
                    <Heart size={24} stroke="#E11D48" fill="#E11D48" />
                  </View>
                  <View style={styles.matchInfo}>
                    <Headline style={styles.matchName}>
                      {match.name}{match.age ? `, ${match.age}` : ''}
                    </Headline>
                    {match.bio && (
                      <Body style={styles.matchBio} numberOfLines={2}>
                        {match.bio}
                      </Body>
                    )}
                    {match.compatibilityScore !== undefined && (
                      <Caption style={styles.matchScore}>
                        {Math.round(match.compatibilityScore * 100)}% match
                      </Caption>
                    )}
                  </View>
                  <ChevronRight size={20} stroke="rgba(0, 0, 0, 0.3)" style={styles.chevron} />
                </Pressable>
              ))}
            </View>
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
    // paddingTop set inline to 40 for Dynamic Island clearance
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#5A5A5A', // Medium GRAY for readability on pale blur
  },
  closeButton: {
    position: 'absolute',
    top: 85, // Below secret triggers (end at y:80)
    right: 16,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000, // Above secret triggers
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    color: 'rgba(0, 0, 0, 0.85)',
    textShadowColor: 'transparent',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(0, 0, 0, 0.5)',
    textShadowColor: 'transparent',
  },
  // Loading state
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    textShadowColor: 'transparent',
  },
  // Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    color: 'rgba(0, 0, 0, 0.85)',
    textShadowColor: 'transparent',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 24,
    textShadowColor: 'transparent',
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  retryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
  },
  // Matches list
  matchesList: {
    gap: 12,
  },
  matchCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // CertificationScreen glass style
    borderRadius: 12,
    // No border - clean glass design like CertificationScreen
  },
  matchAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  matchName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A3A3A', // Charcoal like CertificationScreen itemLabel
    marginBottom: 4,
    textShadowColor: 'transparent',
  },
  matchBio: {
    fontSize: 13,
    color: 'rgba(90, 90, 90, 0.85)', // Charcoal text for contrast on light blur
    lineHeight: 19,
    textShadowColor: 'transparent',
  },
  matchScore: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'transparent',
  },
  matchCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 0.98 }],
  },
  chevron: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  // Detail View styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
    marginLeft: 4,
  },
  detailContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  detailAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  detailPhotoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  detailName: {
    fontSize: 22,
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'transparent',
  },
  detailScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 32,
  },
  detailScoreText: {
    color: '#E11D48',
    fontWeight: '600',
    fontSize: 14,
    textShadowColor: 'transparent',
  },
  detailSection: {
    width: '100%',
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 12,
  },
  detailBio: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 22,
    textShadowColor: 'transparent',
  },
  detailActions: {
    width: '100%',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    // No shadows - clean glass design
    elevation: 0,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  passButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  likeButton: {
    backgroundColor: '#E11D48', // PASSION pink filled
    borderWidth: 0,
  },
  messageButton: {
    width: '100%',
    backgroundColor: '#E11D48',
  },
  messageButtonDisabled: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  messageButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '500',
    fontSize: 15,
  },
});

export default MatchesScreen;
