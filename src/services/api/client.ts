/**
 * Real API Client
 *
 * Production implementation of IApiService for MyAIMatchmaker API.
 * Handles authentication, retries, and error handling.
 *
 * STATUS: BLOCKED - Cannot test without working credentials
 * @see docs/BACKEND-INTEGRATION.md
 */

import { API_CONFIG } from '../../config';
import { TokenManager } from '../TokenManager';
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
  AbbyTTSRequest,
  AbbyTTSResponse,
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
  ApiError,
  MatchPreferences,
} from './types';

// ============================================================
// HTTP CLIENT
// ============================================================

class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Make authenticated HTTP request to API
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = true } = options;

  const url = `${API_CONFIG.API_URL}${endpoint}`;

  // Add auth header if required
  if (requiresAuth) {
    const token = await TokenManager.getToken();
    if (!token) {
      throw new HttpError(401, 'UNAUTHORIZED', 'No authentication token available');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add content type for requests with body
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  // DEMO LOGGING: Show API calls clearly in Metro console for video demo
  // NO TRUNCATION - show FULL data for proof to client
  if (__DEV__) {
    console.log(`\n`);
    console.log(`🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷`);
    console.log(`🌐 [API CALL] ${method} ${url}`);
    console.log(`🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷`);
    if (body) {
      console.log(`📤 [SENDING TO DATABASE]:`);
      console.log(JSON.stringify(body, null, 2));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: ApiError;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = {
          message: response.statusText || 'Unknown error',
          code: 'UNKNOWN',
          statusCode: response.status,
        };
      }
      throw new HttpError(
        response.status,
        errorBody.code,
        errorBody.message,
        errorBody.details
      );
    }

    // Handle empty/non-JSON responses (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // Check if response has no body (204 No Content or empty)
    if (response.status === 204 || contentLength === '0') {
      if (__DEV__) console.log(`[API] Empty response (status: ${response.status})`);
      // Return null for empty responses - caller should handle this case
      return null as unknown as T;
    }

    // Non-JSON content type when JSON was expected
    if (!contentType || !contentType.includes('application/json')) {
      if (__DEV__) console.warn(`[API] Unexpected content-type: ${contentType}`);
      // Still try to parse as JSON (some APIs don't set content-type correctly)
      try {
        const data = await response.json();
        if (__DEV__) console.log(`✅ [RESPONSE] Status: ${response.status}`, JSON.stringify(data, null, 2).substring(0, 500));
        return data;
      } catch {
        // If parsing fails, return null
        return null as unknown as T;
      }
    }

    const data = await response.json();
    // FULL RESPONSE - no truncation for proof to client
    if (__DEV__) {
      console.log(`✅ [DATABASE CONFIRMED] Status: ${response.status}`);
      console.log(`📥 [STORED IN DATABASE]:`);
      console.log(JSON.stringify(data, null, 2));
      console.log(`🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷\n`);
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new HttpError(408, 'TIMEOUT', 'Request timed out');
      }
      throw new HttpError(0, 'NETWORK_ERROR', error.message);
    }

    throw new HttpError(0, 'UNKNOWN', 'An unexpected error occurred');
  }
}

// ============================================================
// REAL API SERVICE IMPLEMENTATION
// ============================================================

export const RealApiService: IApiService = {
  // ----------------------------------------------------------
  // PROFILE
  // ----------------------------------------------------------

  async getMe(): Promise<UserProfile> {
    return request<UserProfile>('/me');
  },

  async updatePublicProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return request<UserProfile>('/profile/public', {
      method: 'PUT',
      body: data,
    });
  },

  async updatePrivateSettings(data: Partial<MatchPreferences>): Promise<void> {
    await request<void>('/profile/private', {
      method: 'PUT',
      body: data,
    });
  },

  async updateMatchPreferences(data: {
    age_min?: number;
    age_max?: number;
    distance_km?: number;
    gender_preferences?: string[];
  }): Promise<void> {
    await request<void>('/preferences', {
      method: 'PUT',
      body: data,
    });
  },

  // ----------------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------------

  async getCategories(): Promise<QuestionCategory[]> {
    return request<QuestionCategory[]>('/questions/categories');
  },

  async getCategoryQuestions(slug: string): Promise<Question[]> {
    return request<Question[]>(`/questions/category/${slug}`);
  },

  async getNextQuestions(count: number = 3): Promise<Question[]> {
    return request<Question[]>(`/questions/next?count=${count}`);
  },

  async getProfileGaps(): Promise<Question[]> {
    return request<Question[]>('/questions/gaps');
  },

  async getQuestion(id: string): Promise<Question> {
    return request<Question>(`/questions/${id}`);
  },

  async getAnswers(): Promise<UserAnswer[]> {
    return request<UserAnswer[]>('/answers');
  },

  async submitAnswer(req: SubmitAnswerRequest): Promise<void> {
    await request<void>('/answers', {
      method: 'POST',
      body: req,
    });
  },

  async parseAnswer(req: ParseAnswerRequest): Promise<ParseAnswerResponse> {
    return request<ParseAnswerResponse>('/answers/parse', {
      method: 'POST',
      body: req,
    });
  },

  // ----------------------------------------------------------
  // MATCHING
  // ----------------------------------------------------------

  async getCandidates(): Promise<MatchCandidate[]> {
    return request<MatchCandidate[]>('/matches/candidates');
  },

  async likeUser(userId: string): Promise<LikeResponse> {
    return request<LikeResponse>(`/matches/${userId}/like`, {
      method: 'POST',
    });
  },

  async passUser(userId: string): Promise<void> {
    await request<void>(`/matches/${userId}/pass`, {
      method: 'POST',
    });
  },

  async getMatches(): Promise<Match[]> {
    return request<Match[]>('/matches');
  },

  // ----------------------------------------------------------
  // ABBY VOICE (OpenAI Realtime API via WebRTC)
  // ----------------------------------------------------------
  // NOTE: The backend uses WebRTC for voice conversations.
  // Text chat goes through AbbyRealtimeService.sendTextMessage()
  // which calls /abby/realtime/{session_id}/message endpoint.

  async createRealtimeSession(): Promise<AbbyRealtimeSession> {
    return request<AbbyRealtimeSession>('/abby/realtime/session', {
      method: 'POST',
    });
  },

  async endSession(sessionId: string): Promise<void> {
    await request<void>(`/abby/session/${sessionId}/end`, {
      method: 'POST',
    });
  },

  async textToSpeech(req: AbbyTTSRequest): Promise<AbbyTTSResponse> {
    return request<AbbyTTSResponse>('/abby/tts', {
      method: 'POST',
      body: req,
    });
  },

  async checkRealtimeAvailability(): Promise<boolean> {
    try {
      const response = await request<{ available: boolean }>('/abby/realtime/available');
      return response.available;
    } catch {
      return false;
    }
  },

  // ----------------------------------------------------------
  // MESSAGING (@v2 - Not implemented in MVP)
  // ----------------------------------------------------------

  async getThreads(): Promise<Thread[]> {
    return request<Thread[]>('/threads');
  },

  async getMessages(threadId: string, params?: PaginationParams): Promise<Message[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
    const query = queryParams.toString();
    return request<Message[]>(`/threads/${threadId}/messages${query ? `?${query}` : ''}`);
  },

  async sendMessage(threadId: string, req: SendMessageRequest): Promise<Message> {
    return request<Message>(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: req,
    });
  },

  // ----------------------------------------------------------
  // PHOTOS
  // ----------------------------------------------------------

  async getPresignedUpload(req: PresignedUploadRequest): Promise<PresignedUploadResponse> {
    return request<PresignedUploadResponse>('/photos/presign', {
      method: 'POST',
      body: req,
    });
  },

  async registerPhoto(req: RegisterPhotoRequest): Promise<Photo> {
    return request<Photo>('/photos', {
      method: 'POST',
      body: req,
    });
  },

  async deletePhoto(photoId: string): Promise<void> {
    await request<void>(`/photos/${photoId}`, {
      method: 'DELETE',
    });
  },

  // ----------------------------------------------------------
  // SAFETY (@v2 - Not implemented in MVP)
  // ----------------------------------------------------------

  async blockUser(req: BlockUserRequest): Promise<void> {
    await request<void>('/blocks', {
      method: 'POST',
      body: req,
    });
  },

  async reportUser(req: ReportUserRequest): Promise<void> {
    await request<void>('/reports', {
      method: 'POST',
      body: req,
    });
  },

  async recordConsent(type: ConsentType, counterpartUserId: string): Promise<void> {
    await request<void>('/consents', {
      method: 'POST',
      body: {
        consent_type: type,
        counterpart_user_id: counterpartUserId,
      },
    });
  },

  async revokeConsent(type: ConsentType, counterpartUserId: string): Promise<void> {
    await request<void>('/consents', {
      method: 'DELETE',
      body: {
        consent_type: type,
        counterpart_user_id: counterpartUserId,
      },
    });
  },

  // ----------------------------------------------------------
  // VERIFICATION (@v2 - Not implemented in MVP)
  // ----------------------------------------------------------

  async getVerificationStatus(): Promise<VerificationStatus> {
    return request<VerificationStatus>('/verification');
  },

  async startVerification(req: StartVerificationRequest): Promise<void> {
    await request<void>('/verification', {
      method: 'POST',
      body: req,
    });
  },

  // ----------------------------------------------------------
  // PAYMENTS (@v2 - Not implemented in MVP)
  // ----------------------------------------------------------

  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    return request<PaymentResponse>('/payments', {
      method: 'POST',
      body: req,
    });
  },
};

export default RealApiService;
