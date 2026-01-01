/**
 * QuestionsService - Interview Questions API Integration
 *
 * Handles the Abby interview flow using the client's questions API.
 * Replaces local questions.json with dynamic API-driven flow.
 *
 * API Endpoints:
 * - GET /v1/questions/categories - Get question categories
 * - GET /v1/questions/category/{slug} - Questions by category
 * - GET /v1/questions/next - Get next question to ask
 * - GET /v1/questions/gaps - Get profile gaps
 * - GET /v1/questions/{id} - Get single question
 * - GET /v1/answers - Get user's answers
 * - POST /v1/answers - Submit answer
 * - POST /v1/answers/parse - Parse natural language to options
 *
 * Usage:
 * - InterviewScreen uses this for the question flow
 * - Dynamically adapts based on user's answers and profile gaps
 */

import { TokenManager } from './TokenManager';
import { secureFetch, type SecureFetchError } from '../utils/secureFetch';

const API_BASE_URL = 'https://dev.api.myaimatchmaker.ai/v1';

// Request timeout for questions API (15 seconds)
const REQUEST_TIMEOUT_MS = 15000;

// ========================================
// Types
// ========================================

export interface Question {
  id: string;
  category: string;
  text: string;
  type: 'multiple_choice' | 'open_ended' | 'scale' | 'yes_no';
  options?: string[];
  required: boolean;
  metadata?: Record<string, any>;
}

export interface Answer {
  questionId: string;
  value: string | number | string[];
  timestamp: string;
}

export interface NextQuestionResponse {
  question: Question;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  hasMore: boolean;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string | number | string[];
  responseTime?: number; // Time taken to answer (ms)
}

export interface SubmitAnswerResponse {
  success: boolean;
  answerId: string;
  nextQuestionId?: string;
}

export interface ParseAnswerRequest {
  questionId: string;
  naturalLanguageAnswer: string;
}

export interface ParseAnswerResponse {
  parsedValue: string | number | string[];
  confidence: number;
  suggestions?: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  questionCount: number;
}

export interface ProfileGap {
  category: string;
  field: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  suggestedQuestionId?: string;
}

// ========================================
// Service Implementation
// ========================================

export class QuestionsService {
  /**
   * Get the next question to ask
   * The API determines the best question based on profile gaps and previous answers
   */
  async getNextQuestion(): Promise<NextQuestionResponse> {
    try {
      if (__DEV__) console.log('[Questions] Fetching next question...');

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/questions/next`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get next question',
          status: response.status,
        };
        throw fetchError;
      }

      const data: NextQuestionResponse = await response.json();

      if (__DEV__) {
        console.log('[Questions] Next question:', data.question.text);
        console.log('[Questions] Progress:', `${data.progress.current}/${data.progress.total}`);
      }

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get next failed:', error);
      // Re-throw secure errors, sanitize others
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get next question' };
    }
  }

  /**
   * Submit an answer to a question
   */
  async submitAnswer(
    questionId: string,
    answer: string | number | string[],
    responseTime?: number
  ): Promise<SubmitAnswerResponse> {
    try {
      if (__DEV__) console.log('[Questions] Submitting answer for:', questionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          answer,
          responseTime,
        } as SubmitAnswerRequest),
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to submit answer',
          status: response.status,
        };
        throw fetchError;
      }

      const data: SubmitAnswerResponse = await response.json();

      if (__DEV__) console.log('[Questions] Answer submitted:', data.answerId);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Submit answer failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to submit answer' };
    }
  }

  /**
   * Parse natural language answer to structured format
   * Useful for open-ended questions that need to map to specific options
   */
  async parseAnswer(
    questionId: string,
    naturalLanguageAnswer: string
  ): Promise<ParseAnswerResponse> {
    try {
      if (__DEV__) console.log('[Questions] Parsing answer:', naturalLanguageAnswer);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/answers/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          naturalLanguageAnswer,
        } as ParseAnswerRequest),
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to parse answer',
          status: response.status,
        };
        throw fetchError;
      }

      const data: ParseAnswerResponse = await response.json();

      if (__DEV__) {
        console.log('[Questions] Parsed value:', data.parsedValue);
        console.log('[Questions] Confidence:', data.confidence);
      }

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Parse answer failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to parse answer' };
    }
  }

  /**
   * Get all question categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      if (__DEV__) console.log('[Questions] Fetching categories...');

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/questions/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get categories',
          status: response.status,
        };
        throw fetchError;
      }

      const data: Category[] = await response.json();

      if (__DEV__) console.log('[Questions] Categories:', data.length);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get categories failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get categories' };
    }
  }

  /**
   * Get questions by category
   */
  async getQuestionsByCategory(categorySlug: string): Promise<Question[]> {
    try {
      if (__DEV__) console.log('[Questions] Fetching questions for:', categorySlug);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(
        `${API_BASE_URL}/questions/category/${encodeURIComponent(categorySlug)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get questions',
          status: response.status,
        };
        throw fetchError;
      }

      const data: Question[] = await response.json();

      if (__DEV__) console.log('[Questions] Questions:', data.length);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get questions failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get questions' };
    }
  }

  /**
   * Get user's profile gaps
   * Returns areas where more questions should be asked
   */
  async getProfileGaps(): Promise<ProfileGap[]> {
    try {
      if (__DEV__) console.log('[Questions] Fetching profile gaps...');

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/questions/gaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get profile gaps',
          status: response.status,
        };
        throw fetchError;
      }

      const data: ProfileGap[] = await response.json();

      if (__DEV__) console.log('[Questions] Profile gaps:', data.length);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get gaps failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get profile gaps' };
    }
  }

  /**
   * Get all user's answers
   */
  async getUserAnswers(): Promise<Answer[]> {
    try {
      if (__DEV__) console.log('[Questions] Fetching user answers...');

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/answers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get answers',
          status: response.status,
        };
        throw fetchError;
      }

      const data: Answer[] = await response.json();

      if (__DEV__) console.log('[Questions] User answers:', data.length);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get answers failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get answers' };
    }
  }

  /**
   * Get a specific question by ID
   */
  async getQuestionById(questionId: string): Promise<Question> {
    try {
      if (__DEV__) console.log('[Questions] Fetching question:', questionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/questions/${encodeURIComponent(questionId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get question',
          status: response.status,
        };
        throw fetchError;
      }

      const data: Question = await response.json();

      if (__DEV__) console.log('[Questions] Question:', data.text);

      return data;
    } catch (error) {
      if (__DEV__) console.error('[Questions] Get question failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get question' };
    }
  }
}

// Export singleton instance
export const questionsService = new QuestionsService();

export default questionsService;
