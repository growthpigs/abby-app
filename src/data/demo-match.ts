/**
 * Demo Match - Mock match profile for demo
 *
 * Used after searching phase to show a "found" match.
 */

import { MatchProfile } from '../store/useDemoStore';

export const DEMO_MATCH: MatchProfile = {
  name: 'Alex',
  age: 28,
  bio: "Coffee enthusiast, weekend hiker, and dog lover. Looking for someone who appreciates a good sunset and better conversation. I believe the best relationships are built on laughter, honesty, and shared adventures.",
  photoUrl: 'https://example.com/alex-photo.jpg',
  compatibilityScore: 87,
};

export default DEMO_MATCH;
