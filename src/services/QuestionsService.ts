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
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.API_URL;

// Request timeout for questions API (15 seconds)
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Options for cancellable API requests
 */
export interface RequestOptions {
  /** AbortSignal for cancelling in-flight requests */
  signal?: AbortSignal;
}

// ========================================
// Types - Matches actual API response
// ========================================

/**
 * Raw question from API (snake_case)
 */
export interface ApiQuestion {
  question_id: string;
  question_code: string;
  category_id: number;
  category_name: string;
  question_text: string;
  llm_prompt: string;
  llm_context: string;
  llm_followup_prompt: string | null;
  parsing_hints: Record<string, unknown>;
  question_type: 'open_ended' | 'single_select' | 'multi_select' | 'scale';
  screen_group: string;
  display_order: number;
  importance_tier: number;
  dealbreaker_eligible: boolean;
  options: ApiQuestionOption[];
}

export interface ApiQuestionOption {
  option_id: string;
  option_code: string;
  option_text: string;
  synonyms: string[];
  display_order: number;
}

/**
 * Raw API response for /v1/questions/next
 */
export interface ApiNextQuestionsResponse {
  questions: ApiQuestion[];
  profile_completion: number;
  total_questions: string; // API returns as string
  answered_questions: string; // API returns as string
}

/**
 * Normalized question for app use (camelCase)
 */
export interface Question {
  id: string;
  category: string;
  text: string;
  type: 'multiple_choice' | 'open_ended' | 'scale' | 'yes_no';
  options?: string[];
  required: boolean;
  metadata?: Record<string, unknown>;
}

export interface Answer {
  questionId: string;
  value: string | number | string[];
  timestamp: string;
}

/**
 * Raw API answer format (snake_case)
 */
interface ApiAnswer {
  question_id: string;
  answer: string | number | string[];
  answered_at: string;
}

/**
 * Normalized response for app use
 */
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
   * Transform API question type to our normalized type
   */
  private mapQuestionType(apiType: string): Question['type'] {
    const typeMap: Record<string, Question['type']> = {
      'open_ended': 'open_ended',
      'single_select': 'multiple_choice',
      'multi_select': 'multiple_choice',
      'scale': 'scale',
      'yes_no': 'yes_no',
    };

    const mappedType = typeMap[apiType];
    if (!mappedType) {
      // Log unknown type for debugging - helps detect API changes early
      if (__DEV__) {
        console.warn(
          `[QuestionsService] Unknown question type from API: "${apiType}". ` +
          `Defaulting to 'open_ended'. Consider adding to typeMap if intentional.`
        );
      }
      return 'open_ended';
    }
    return mappedType;
  }

  /**
   * Transform raw API question to normalized Question
   */
  private transformQuestion(apiQ: ApiQuestion): Question {
    return {
      id: apiQ.question_id,
      category: apiQ.category_name,
      text: apiQ.llm_prompt || apiQ.question_text, // Use LLM prompt if available
      type: this.mapQuestionType(apiQ.question_type),
      options: apiQ.options?.map(o => o.option_text),
      required: apiQ.importance_tier <= 2, // Tier 1-2 are required
      metadata: {
        vibe_shift: apiQ.screen_group, // Map screen_group to vibe
        question_code: apiQ.question_code,
        dealbreaker_eligible: apiQ.dealbreaker_eligible,
      },
    };
  }

  /**
   * Get the next question to ask
   * The API determines the best question based on profile gaps and previous answers
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getNextQuestion(options?: RequestOptions): Promise<NextQuestionResponse> {
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
        signal: options?.signal,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get next question',
          status: response.status,
        };
        throw fetchError;
      }

      // Parse raw API response
      const apiData: ApiNextQuestionsResponse = await response.json();

      // Validate we have questions
      if (!apiData.questions || apiData.questions.length === 0) {
        throw { code: 'NO_QUESTIONS', message: 'No questions available' };
      }

      // Transform to normalized format (take first question)
      // Validate numeric fields with explicit logging for API contract violations
      const parsedTotal = parseInt(apiData.total_questions, 10);
      const parsedAnswered = parseInt(apiData.answered_questions, 10);

      if (isNaN(parsedTotal) && __DEV__) {
        console.warn(
          `[QuestionsService] Invalid total_questions from API: "${apiData.total_questions}". ` +
          'Expected numeric string. Defaulting to 0.'
        );
      }
      if (isNaN(parsedAnswered) && __DEV__) {
        console.warn(
          `[QuestionsService] Invalid answered_questions from API: "${apiData.answered_questions}". ` +
          'Expected numeric string. Defaulting to 0.'
        );
      }

      const total = isNaN(parsedTotal) ? 0 : parsedTotal;
      const answered = isNaN(parsedAnswered) ? 0 : parsedAnswered;
      const current = answered + 1;

      const normalizedResponse: NextQuestionResponse = {
        question: this.transformQuestion(apiData.questions[0]),
        progress: {
          current,
          total,
          percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
        },
        hasMore: current < total,
      };

      if (__DEV__) {
        console.log('[Questions] Next question:', normalizedResponse.question.text);
        console.log('[Questions] Progress:', `${current}/${total}`);
      }

      return normalizedResponse;
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
   * @param questionId - The question ID to answer
   * @param answer - The answer value
   * @param responseTime - Optional response time in ms
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async submitAnswer(
    questionId: string,
    answer: string | number | string[],
    responseTime?: number,
    options?: RequestOptions
  ): Promise<SubmitAnswerResponse> {
    try {
      if (__DEV__) console.log('[Questions] Submitting answer for:', questionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // API expects snake_case: question_id, not questionId
      const response = await secureFetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: questionId,  // API uses snake_case
          answer,
          response_time: responseTime,  // Likely also snake_case
        }),
        timeout: REQUEST_TIMEOUT_MS,
        signal: options?.signal,
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
   * @param questionId - The question ID to parse against
   * @param naturalLanguageAnswer - The natural language answer text
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async parseAnswer(
    questionId: string,
    naturalLanguageAnswer: string,
    options?: RequestOptions
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
          question_id: questionId,  // API uses snake_case
          natural_language_answer: naturalLanguageAnswer,
        }),
        timeout: REQUEST_TIMEOUT_MS,
        signal: options?.signal,
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
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getCategories(options?: RequestOptions): Promise<Category[]> {
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
        signal: options?.signal,
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
   * @param categorySlug - The category slug to filter by
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getQuestionsByCategory(categorySlug: string, options?: RequestOptions): Promise<Question[]> {
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
          signal: options?.signal,
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
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getProfileGaps(options?: RequestOptions): Promise<ProfileGap[]> {
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
        signal: options?.signal,
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
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getUserAnswers(options?: RequestOptions): Promise<Answer[]> {
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
        signal: options?.signal,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get answers',
          status: response.status,
        };
        throw fetchError;
      }

      // API returns snake_case, transform to camelCase
      const apiData: ApiAnswer[] = await response.json();
      const answers: Answer[] = apiData.map(a => ({
        questionId: a.question_id,
        value: a.answer,
        timestamp: a.answered_at,
      }));

      if (__DEV__) console.log('[Questions] User answers:', answers.length);

      return answers;
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
   * @param questionId - The question ID to retrieve
   * @param options - Optional request options including AbortSignal for cancellation
   */
  async getQuestionById(questionId: string, options?: RequestOptions): Promise<Question> {
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
        signal: options?.signal,
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
