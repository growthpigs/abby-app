/**
 * Onboarding Question IDs
 *
 * These are the question_ids from the backend for the "Onboarding" category.
 * Used to submit onboarding data via POST /v1/answers.
 *
 * Source: GET /v1/questions/category/onboarding
 * Last verified: 2026-01-13
 */

export const ONBOARDING_QUESTION_IDS = {
  // ONB_001: Name - handled by Cognito signup, not submitted here
  NAME: 'b7ee2b57-0100-4dfb-b918-50408b3cfc71',

  // ONB_002: DOB - also sent to /v1/profile/public as 'birthday'
  DOB: '6527b313-e495-42aa-9ae2-d587cde312ca',

  // ONB_003: Sexual Identity (Gender)
  GENDER: '0ef7507c-0398-49bb-ac6b-d991122ddf61',

  // ONB_004: Sexual Preference (Dating Preference)
  DATING_PREFERENCE: 'b253cb40-6341-4cfa-b65a-a44bb3f2a6b1',

  // ONB_005: Ethnicity
  ETHNICITY: 'd20594d0-40d2-4869-9604-2a1e726f025e',

  // ONB_006: Ethnicity Preferred (multi_select)
  ETHNICITY_PREFERENCES: 'c8a18851-b77a-4f2d-a3eb-072213c2b93a',

  // ONB_007: Relationship Type
  RELATIONSHIP_TYPE: 'a703994d-dab1-4b58-9e97-709293225b7b',

  // ONB_008: Smoking
  SMOKING: '97048010-edf4-4099-b576-a00868969da3',
} as const;

export type OnboardingQuestionKey = keyof typeof ONBOARDING_QUESTION_IDS;
