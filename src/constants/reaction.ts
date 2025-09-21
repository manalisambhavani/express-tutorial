export const ALLOWED_REACTIONS = ['like', 'love', 'happy', 'celebrate', 'insightful', 'funny'] as const;
export type ReactionType = typeof ALLOWED_REACTIONS[number];