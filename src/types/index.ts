export type Axis = 1 | 2 | 3;

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  complexity: Axis;
  provocation: Axis;
  unexpectedness: Axis;
  weight: number;
  enabled: boolean;
}

export type QuestionCategory = 'philosophical' | 'dating' | 'party' | 'kids';
export type QuestionSource = 'author' | 'user';

export interface Question {
  id: string;
  text: string;
  complexity: Axis;
  provocation: Axis;
  unexpectedness: Axis;
  likes: number;
  dislikes: number;
  category: QuestionCategory;
  source: QuestionSource;
}

export type WeightGroup = 'low' | 'mid' | 'high';

export interface CardSlot {
  recipe: Recipe;
  question: Question;
  group: WeightGroup;
}

export type CardAnimState = 'entering' | 'resting' | 'fly-left' | 'fly-right' | 'centering' | 'flipped';
