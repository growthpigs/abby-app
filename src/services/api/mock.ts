/**
 * Mock API Service
 *
 * Mock implementation of IApiService for development without backend.
 * Uses local data and simulates network delays.
 *
 * @see docs/BACKEND-INTEGRATION.md for integration status
 */

import {
  IApiService,
  UserProfile,
  QuestionCategory,
  Question,
  UserAnswer,
  SubmitAnswerRequest,
  ParseAnswerRequest,
  ParseAnswerResponse,
  MatchCandidate,
  Match,
  LikeResponse,
  AbbyRealtimeSession,
  AbbyMemoryContext,
  AbbyToolExecuteRequest,
  AbbyToolExecuteResponse,
  AbbyTTSRequest,
  AbbyTTSResponse,
  AbbyChatRequest,
  AbbyChatResponse,
  Thread,
  Message,
  SendMessageRequest,
  PaginationParams,
  PresignedUploadRequest,
  PresignedUploadResponse,
  RegisterPhotoRequest,
  Photo,
  BlockUserRequest,
  ReportUserRequest,
  ConsentType,
  VerificationStatus,
  StartVerificationRequest,
  PaymentRequest,
  PaymentResponse,
  MatchPreferences,
  VibeState,
} from './types';

// Import existing demo data
import { DEMO_QUESTIONS } from '../../data/demo-questions';
import { DEMO_MATCH } from '../../data/demo-match';

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_USER_PROFILE: UserProfile = {
  id: 'user_mock_001',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'TestUser',
  dateOfBirth: '1995-06-15',
  gender: 'other',
  bio: 'This is a mock profile for development.',
  photos: [],
  preferences: {
    ageMin: 25,
    ageMax: 40,
    genders: ['male', 'female', 'non_binary'],
    distance: 50,
    relationshipType: 'long_term',
  },
};

const MOCK_CATEGORIES: QuestionCategory[] = [
  {
    id: 'cat_1',
    slug: 'basics',
    name: 'The Basics',
    description: 'Get to know the essentials',
    questionCount: 10,
  },
  {
    id: 'cat_2',
    slug: 'values',
    name: 'Values & Beliefs',
    description: 'What matters most to you',
    questionCount: 15,
  },
  {
    id: 'cat_3',
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'How you live your life',
    questionCount: 12,
  },
  {
    id: 'cat_4',
    slug: 'relationships',
    name: 'Relationships',
    description: 'Your relationship style',
    questionCount: 20,
  },
  {
    id: 'cat_5',
    slug: 'future',
    name: 'Future Plans',
    description: 'Where you see yourself',
    questionCount: 8,
  },
];

// Convert demo questions to API format
const MOCK_QUESTIONS: Question[] = DEMO_QUESTIONS.map((dq, index) => ({
  id: dq.id,
  categorySlug: dq.category,
  text: dq.text,
  voiceText: dq.text, // Same for now
  type: 'text' as const,
  required: true,
  vibeState: (dq.vibe_shift || 'TRUST') as VibeState,
}));

const MOCK_MATCH_CANDIDATES: MatchCandidate[] = [
  {
    id: 'match_001',
    displayName: DEMO_MATCH.name,
    age: DEMO_MATCH.age,
    bio: DEMO_MATCH.bio,
    photos: [
      {
        id: 'photo_001',
        url: DEMO_MATCH.photoUrl,
        isPrimary: true,
        order: 0,
      },
    ],
    compatibility: DEMO_MATCH.compatibilityScore,
    commonInterests: ['hiking', 'coffee', 'dogs'],
    distance: 5,
  },
  {
    id: 'match_002',
    displayName: 'Jordan',
    age: 31,
    bio: 'Artist and coffee lover. Always looking for the next adventure.',
    photos: [],
    compatibility: 82,
    commonInterests: ['art', 'travel', 'coffee'],
    distance: 12,
  },
];

// In-memory state for mock
let mockAnswers: UserAnswer[] = [];
let mockMatches: Match[] = [];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Simulate network delay */
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/** Generate mock ID */
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================================
// MOCK API SERVICE IMPLEMENTATION
// ============================================================

export const MockApiService: IApiService = {
  // ----------------------------------------------------------
  // PROFILE
  // ----------------------------------------------------------

  async getMe(): Promise<UserProfile> {
    if (__DEV__) console.log('[MockAPI] getMe()');
    await delay(300);
    return { ...MOCK_USER_PROFILE };
  },

  async updatePublicProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    if (__DEV__) console.log('[MockAPI] updatePublicProfile()', data);
    await delay(400);
    Object.assign(MOCK_USER_PROFILE, data);
    return { ...MOCK_USER_PROFILE };
  },

  async updatePrivateSettings(data: Partial<MatchPreferences>): Promise<void> {
    if (__DEV__) console.log('[MockAPI] updatePrivateSettings()', data);
    await delay(300);
    Object.assign(MOCK_USER_PROFILE.preferences, data);
  },

  // ----------------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------------

  async getCategories(): Promise<QuestionCategory[]> {
    if (__DEV__) console.log('[MockAPI] getCategories()');
    await delay(400);
    return [...MOCK_CATEGORIES];
  },

  async getCategoryQuestions(slug: string): Promise<Question[]> {
    if (__DEV__) console.log('[MockAPI] getCategoryQuestions()', slug);
    await delay(350);
    return MOCK_QUESTIONS.filter((q) => q.categorySlug === slug);
  },

  async getNextQuestions(count: number = 3): Promise<Question[]> {
    if (__DEV__) console.log('[MockAPI] getNextQuestions()', count);
    await delay(300);
    // Return questions not yet answered
    const answeredIds = new Set(mockAnswers.map((a) => a.questionId));
    const unanswered = MOCK_QUESTIONS.filter((q) => !answeredIds.has(q.id));
    return unanswered.slice(0, count);
  },

  async getProfileGaps(): Promise<Question[]> {
    if (__DEV__) console.log('[MockAPI] getProfileGaps()');
    await delay(350);
    // Return required questions not yet answered
    const answeredIds = new Set(mockAnswers.map((a) => a.questionId));
    return MOCK_QUESTIONS.filter((q) => q.required && !answeredIds.has(q.id));
  },

  async getQuestion(id: string): Promise<Question> {
    if (__DEV__) console.log('[MockAPI] getQuestion()', id);
    await delay(200);
    const question = MOCK_QUESTIONS.find((q) => q.id === id);
    if (!question) throw new Error(`Question not found: ${id}`);
    return { ...question };
  },

  async getAnswers(): Promise<UserAnswer[]> {
    if (__DEV__) console.log('[MockAPI] getAnswers()');
    await delay(300);
    return [...mockAnswers];
  },

  async submitAnswer(request: SubmitAnswerRequest): Promise<void> {
    if (__DEV__) console.log('[MockAPI] submitAnswer()', request);
    await delay(400);
    const answer: UserAnswer = {
      questionId: request.questionId,
      answer: request.answer,
      answeredAt: new Date().toISOString(),
      answerMethod: request.answerMethod,
    };
    // Update or add
    const existingIndex = mockAnswers.findIndex((a) => a.questionId === request.questionId);
    if (existingIndex >= 0) {
      mockAnswers[existingIndex] = answer;
    } else {
      mockAnswers.push(answer);
    }
  },

  async parseAnswer(request: ParseAnswerRequest): Promise<ParseAnswerResponse> {
    if (__DEV__) console.log('[MockAPI] parseAnswer()', request);
    await delay(600);
    // Simple mock: return the input as text
    return {
      parsedAnswer: { text: request.naturalLanguageInput },
      confidence: 0.85,
    };
  },

  // ----------------------------------------------------------
  // MATCHING
  // ----------------------------------------------------------

  async getCandidates(): Promise<MatchCandidate[]> {
    if (__DEV__) console.log('[MockAPI] getCandidates()');
    await delay(800);
    return [...MOCK_MATCH_CANDIDATES];
  },

  async likeUser(userId: string): Promise<LikeResponse> {
    if (__DEV__) console.log('[MockAPI] likeUser()', userId);
    await delay(500);

    // 70% chance of match for demo
    const matched = Math.random() > 0.3;

    if (matched) {
      const candidate = MOCK_MATCH_CANDIDATES.find((c) => c.id === userId);
      if (candidate) {
        const match: Match = {
          id: generateId('match'),
          matchedAt: new Date().toISOString(),
          user: candidate,
          status: 'matched',
          conversationStarted: false,
        };
        mockMatches.push(match);
        return { matched: true, match };
      }
    }

    return { matched: false };
  },

  async passUser(userId: string): Promise<void> {
    if (__DEV__) console.log('[MockAPI] passUser()', userId);
    await delay(300);
    // In real API, this would record the pass
  },

  async getMatches(): Promise<Match[]> {
    if (__DEV__) console.log('[MockAPI] getMatches()');
    await delay(400);
    return [...mockMatches];
  },

  // ----------------------------------------------------------
  // ABBY VOICE
  // ----------------------------------------------------------

  async createRealtimeSession(): Promise<AbbyRealtimeSession> {
    if (__DEV__) console.log('[MockAPI] createRealtimeSession()');
    await delay(600);
    console.warn('[MockAPI] Voice sessions require real backend - returning mock session');
    return {
      sessionId: generateId('session'),
      clientSecret: 'mock_client_secret_not_functional',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  },

  async endSession(sessionId: string): Promise<void> {
    if (__DEV__) console.log('[MockAPI] endSession()', sessionId);
    await delay(200);
  },

  async getMemoryContext(): Promise<AbbyMemoryContext> {
    if (__DEV__) console.log('[MockAPI] getMemoryContext()');
    await delay(400);
    return {
      entries: [
        {
          type: 'user_fact',
          content: 'Looking for a meaningful connection',
          timestamp: new Date().toISOString(),
        },
      ],
      summary: 'New user just starting their journey',
    };
  },

  async injectMessage(sessionId: string, message: string): Promise<void> {
    if (__DEV__) console.log('[MockAPI] injectMessage()', sessionId, message);
    await delay(200);
  },

  async executeToolCall(request: AbbyToolExecuteRequest): Promise<AbbyToolExecuteResponse> {
    if (__DEV__) console.log('[MockAPI] executeToolCall()', request);
    await delay(300);
    return {
      result: { success: true },
    };
  },

  async textToSpeech(request: AbbyTTSRequest): Promise<AbbyTTSResponse> {
    if (__DEV__) console.log('[MockAPI] textToSpeech()', request);
    await delay(500);
    return {
      audioUrl: 'mock://audio/not-available',
      duration: 2.5,
    };
  },

  async checkRealtimeAvailability(): Promise<boolean> {
    if (__DEV__) console.log('[MockAPI] checkRealtimeAvailability()');
    await delay(200);
    // In mock mode, realtime is not available
    return false;
  },

  async sendChatMessage(request: AbbyChatRequest): Promise<AbbyChatResponse> {
    if (__DEV__) console.log('[MockAPI] sendChatMessage()', request);
    await delay(800);

    // Simple mock responses
    const responses = [
      "That's a thoughtful answer. Tell me more about what matters to you.",
      "I appreciate you sharing that with me. What else would you like to explore?",
      "Interesting! Let's dig a little deeper into that.",
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      conversationId: request.conversationId || generateId('conv'),
    };
  },

  // ----------------------------------------------------------
  // MESSAGING
  // ----------------------------------------------------------

  async getThreads(): Promise<Thread[]> {
    if (__DEV__) console.log('[MockAPI] getThreads()');
    await delay(400);
    // Return threads for current matches
    return mockMatches.map((match) => ({
      id: `thread_${match.id}`,
      matchId: match.id,
      participants: [
        { userId: MOCK_USER_PROFILE.id, displayName: MOCK_USER_PROFILE.displayName },
        { userId: match.user.id, displayName: match.user.displayName },
      ],
      unreadCount: 0,
      createdAt: match.matchedAt,
      updatedAt: match.matchedAt,
    }));
  },

  async getMessages(threadId: string, params?: PaginationParams): Promise<Message[]> {
    if (__DEV__) console.log('[MockAPI] getMessages()', threadId, params);
    await delay(300);
    // Return empty for now - no messages yet
    return [];
  },

  async sendMessage(threadId: string, request: SendMessageRequest): Promise<Message> {
    if (__DEV__) console.log('[MockAPI] sendMessage()', threadId, request);
    await delay(400);
    return {
      id: generateId('msg'),
      threadId,
      senderId: MOCK_USER_PROFILE.id,
      content: request.content,
      type: request.type,
      createdAt: new Date().toISOString(),
    };
  },

  // ----------------------------------------------------------
  // PHOTOS
  // ----------------------------------------------------------

  async getPresignedUpload(request: PresignedUploadRequest): Promise<PresignedUploadResponse> {
    if (__DEV__) console.log('[MockAPI] getPresignedUpload()', request);
    await delay(400);
    return {
      uploadUrl: 'mock://s3/upload-not-functional',
      fileKey: `photos/${MOCK_USER_PROFILE.id}/${generateId('photo')}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  },

  async registerPhoto(request: RegisterPhotoRequest): Promise<Photo> {
    if (__DEV__) console.log('[MockAPI] registerPhoto()', request);
    await delay(300);
    const photo: Photo = {
      id: generateId('photo'),
      url: `https://mock.cdn.com/${request.fileKey}`,
      isPrimary: request.isPrimary,
      order: request.order,
    };
    MOCK_USER_PROFILE.photos.push(photo);
    return photo;
  },

  async deletePhoto(photoId: string): Promise<void> {
    if (__DEV__) console.log('[MockAPI] deletePhoto()', photoId);
    await delay(300);
    MOCK_USER_PROFILE.photos = MOCK_USER_PROFILE.photos.filter((p) => p.id !== photoId);
  },

  // ----------------------------------------------------------
  // SAFETY
  // ----------------------------------------------------------

  async blockUser(request: BlockUserRequest): Promise<void> {
    if (__DEV__) console.log('[MockAPI] blockUser()', request);
    await delay(300);
  },

  async reportUser(request: ReportUserRequest): Promise<void> {
    if (__DEV__) console.log('[MockAPI] reportUser()', request);
    await delay(400);
  },

  async recordConsent(type: ConsentType): Promise<void> {
    if (__DEV__) console.log('[MockAPI] recordConsent()', type);
    await delay(200);
  },

  async revokeConsent(type: ConsentType): Promise<void> {
    if (__DEV__) console.log('[MockAPI] revokeConsent()', type);
    await delay(200);
  },

  // ----------------------------------------------------------
  // VERIFICATION
  // ----------------------------------------------------------

  async getVerificationStatus(): Promise<VerificationStatus> {
    if (__DEV__) console.log('[MockAPI] getVerificationStatus()');
    await delay(300);
    return {
      emailVerified: true, // Mock as verified
      phoneVerified: false,
      idVerified: false,
      photoVerified: false,
    };
  },

  async startVerification(request: StartVerificationRequest): Promise<void> {
    if (__DEV__) console.log('[MockAPI] startVerification()', request);
    await delay(400);
  },

  // ----------------------------------------------------------
  // PAYMENTS
  // ----------------------------------------------------------

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (__DEV__) console.log('[MockAPI] createPayment()', request);
    await delay(600);
    return {
      paymentId: generateId('pay'),
      status: 'succeeded', // Mock as successful
    };
  },
};

export default MockApiService;
