/**
 * API Type Contracts
 *
 * TypeScript interfaces matching the MyAIMatchmaker API spec.
 * These are THE SOURCE OF TRUTH for frontend-backend contracts.
 *
 * @see https://dev.api.myaimatchmaker.ai/docs#/
 * @see docs/BACKEND-INTEGRATION.md
 */

// ============================================================
// USER & PROFILE
// ============================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  bio: string;
  photos: Photo[];
  location?: Location;
  preferences: MatchPreferences;
}

export type Gender = 'male' | 'female' | 'non_binary' | 'other';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state?: string;
  country?: string;
}

export interface MatchPreferences {
  ageMin: number;
  ageMax: number;
  genders: Gender[];
  distance: number; // in miles
  relationshipType: RelationshipType;
}

export type RelationshipType = 'long_term' | 'short_term' | 'friends' | 'casual';

export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

// ============================================================
// QUESTIONS & ANSWERS
// ============================================================

export interface QuestionCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  questionCount: number;
  icon?: string;
}

export interface Question {
  id: string;
  categorySlug: string;
  text: string;
  voiceText: string; // How Abby speaks it
  type: QuestionType;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  required: boolean;
  vibeState: VibeState;
}

export type QuestionType = 'choice' | 'multi_choice' | 'scale' | 'text' | 'picturegram';

export interface QuestionOption {
  id: string;
  text: string;
  voiceText?: string; // Optional different voice version
}

export type VibeState = 'TRUST' | 'DEEP' | 'CAUTION' | 'PASSION' | 'GROWTH' | 'ALERT';

export interface UserAnswer {
  questionId: string;
  answer: AnswerValue;
  answeredAt: string;
  answerMethod: AnswerMethod;
}

export interface AnswerValue {
  selected?: string | string[]; // For choice/multi_choice
  value?: number; // For scale
  text?: string; // For text
}

export type AnswerMethod = 'touch' | 'voice';

// Request/Response for answers endpoint
export interface SubmitAnswerRequest {
  questionId: string;
  answer: AnswerValue;
  answerMethod: AnswerMethod;
}

export interface ParseAnswerRequest {
  questionId: string;
  naturalLanguageInput: string;
}

export interface ParseAnswerResponse {
  parsedAnswer: AnswerValue;
  confidence: number;
  alternatives?: AnswerValue[];
}

// ============================================================
// MATCHING
// ============================================================

export interface MatchCandidate {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  photos: Photo[];
  compatibility: number; // 0-100
  commonInterests: string[];
  distance?: number; // in miles
}

export interface Match {
  id: string;
  matchedAt: string;
  user: MatchCandidate;
  status: MatchStatus;
  conversationStarted: boolean;
}

export type MatchStatus = 'pending' | 'matched' | 'unmatched' | 'blocked';

export interface LikeResponse {
  matched: boolean;
  match?: Match;
}

// ============================================================
// ABBY VOICE (OpenAI Realtime API)
// ============================================================

export interface AbbyRealtimeSession {
  sessionId: string;
  clientSecret: string; // For OpenAI Realtime WebRTC
  expiresAt: string;
  configuration?: AbbySessionConfig;
}

export interface AbbySessionConfig {
  voice?: string;
  systemPrompt?: string;
  tools?: AbbyTool[];
}

export interface AbbyTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AbbyTTSRequest {
  text: string;
  voice?: string;
}

export interface AbbyTTSResponse {
  audioUrl: string;
  duration: number;
}

// ============================================================
// MESSAGING (@v2 - Not implemented in MVP)
// ============================================================

export interface Thread {
  id: string;
  matchId: string;
  participants: ThreadParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  userId: string;
  displayName: string;
  photoUrl?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  type: MessageType;
  readAt?: string;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'voice' | 'system';

export interface SendMessageRequest {
  content: string;
  type: MessageType;
}

// ============================================================
// PHOTOS & MEDIA
// ============================================================

export interface PresignedUploadRequest {
  filename: string;
  contentType: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}

export interface RegisterPhotoRequest {
  photo_id: string;      // S3 file key returned from presign
  is_primary: boolean;
  order_index: number;
}

// ============================================================
// SAFETY & CONSENT
// ============================================================

export interface BlockUserRequest {
  userId: string;
  reason?: string;
}

export interface ReportUserRequest {
  userId: string;
  reason: ReportReason;
  details?: string;
}

export type ReportReason =
  | 'harassment'
  | 'inappropriate_content'
  | 'spam'
  | 'fake_profile'
  | 'underage'
  | 'other';

/**
 * Consent API types
 *
 * Note: This API is for match-specific consent (sharing info with a matched user),
 * NOT for onboarding terms acceptance. Terms/Privacy acceptance is handled locally.
 */
export interface ConsentRecord {
  consent_type: ConsentType;
  counterpart_user_id: string;
  created_at?: string;
}

export interface RecordConsentRequest {
  consent_type: ConsentType;
  counterpart_user_id: string;
}

export type ConsentType =
  | 'photo_exchange'      // Consent to exchange photos with match
  | 'phone_exchange'      // Consent to share phone number
  | 'payment_agreement'   // Consent for payment/reveal flow
  | 'private_photos';     // Consent to view private photos

// ============================================================
// VERIFICATION & PAYMENTS
// ============================================================

export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  photoVerified: boolean;
}

export interface StartVerificationRequest {
  type: VerificationType;
}

export type VerificationType = 'email' | 'phone' | 'id' | 'photo';

export interface PaymentRequest {
  amount: number;
  currency: string;
  productId: string;
  paymentMethodId?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  clientSecret?: string; // For Stripe
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// SERVICE INTERFACE (Contract for mock/real swap)
// ============================================================

/**
 * IApiService - The contract that both mock and real clients implement.
 * This enables seamless switching via USE_REAL_API flag.
 */
export interface IApiService {
  // Profile
  getMe(): Promise<UserProfile>;
  updatePublicProfile(data: Partial<UserProfile>): Promise<UserProfile>;
  updatePrivateSettings(data: Partial<MatchPreferences>): Promise<void>;
  updateMatchPreferences(data: {
    age_min?: number;
    age_max?: number;
    distance_km?: number;
    gender_preferences?: string[];
  }): Promise<void>;

  // Questions
  getCategories(): Promise<QuestionCategory[]>;
  getCategoryQuestions(slug: string): Promise<Question[]>;
  getNextQuestions(count?: number): Promise<Question[]>;
  getProfileGaps(): Promise<Question[]>;
  getQuestion(id: string): Promise<Question>;
  getAnswers(): Promise<UserAnswer[]>;
  submitAnswer(request: SubmitAnswerRequest): Promise<void>;
  parseAnswer(request: ParseAnswerRequest): Promise<ParseAnswerResponse>;

  // Matching
  getCandidates(): Promise<MatchCandidate[]>;
  likeUser(userId: string): Promise<LikeResponse>;
  passUser(userId: string): Promise<void>;
  getMatches(): Promise<Match[]>;

  // Abby Voice (OpenAI Realtime API via WebRTC)
  createRealtimeSession(): Promise<AbbyRealtimeSession>;
  endSession(sessionId: string): Promise<void>;
  textToSpeech(request: AbbyTTSRequest): Promise<AbbyTTSResponse>;
  checkRealtimeAvailability(): Promise<boolean>;

  // Messaging (@v2 - Not implemented in MVP)
  getThreads(): Promise<Thread[]>;
  getMessages(threadId: string, params?: PaginationParams): Promise<Message[]>;
  sendMessage(threadId: string, request: SendMessageRequest): Promise<Message>;

  // Photos
  getPresignedUpload(request: PresignedUploadRequest): Promise<PresignedUploadResponse>;
  registerPhoto(request: RegisterPhotoRequest): Promise<Photo>;
  deletePhoto(photoId: string): Promise<void>;

  // Safety (@v2 - Not implemented in MVP)
  blockUser(request: BlockUserRequest): Promise<void>;
  reportUser(request: ReportUserRequest): Promise<void>;
  recordConsent(type: ConsentType, counterpartUserId: string): Promise<void>;
  revokeConsent(type: ConsentType, counterpartUserId: string): Promise<void>;

  // Verification (@v2 - Not implemented in MVP)
  getVerificationStatus(): Promise<VerificationStatus>;
  startVerification(request: StartVerificationRequest): Promise<void>;

  // Payments (@v2 - Not implemented in MVP)
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
}
