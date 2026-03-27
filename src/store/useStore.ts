import { useState, useEffect, useCallback } from 'react';
import type { Recipe, Question } from '../types';
import { DEFAULT_RECIPES } from '../data/recipes';
import { DEFAULT_QUESTIONS } from '../data/questions';

const RECIPES_KEY = 'vd_recipes';
const QUESTIONS_KEY = 'vd_questions';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadRecipes(): Recipe[] {
  const stored = loadFromStorage<Recipe[]>(RECIPES_KEY, DEFAULT_RECIPES);
  return stored.map(r => {
    const def = DEFAULT_RECIPES.find(d => d.id === r.id);
    return { ...def, ...r, icon: r.icon ?? def?.icon ?? '❓' };
  });
}

function loadQuestions(): Question[] {
  const stored = loadFromStorage<Question[]>(QUESTIONS_KEY, []);
  const defaultIds = new Set(DEFAULT_QUESTIONS.map(q => q.id));
  const userAdded = stored.filter(q => q.source === 'user' && !defaultIds.has(q.id));
  return [...DEFAULT_QUESTIONS, ...userAdded];
}

export function useStore() {
  const [recipes, setRecipesState] = useState<Recipe[]>(() => loadRecipes());
  const [questions, setQuestionsState] = useState<Question[]>(() => loadQuestions());

  useEffect(() => { saveToStorage(RECIPES_KEY, recipes); }, [recipes]);
  useEffect(() => { saveToStorage(QUESTIONS_KEY, questions); }, [questions]);

  const setRecipes = useCallback((updater: (prev: Recipe[]) => Recipe[]) => {
    setRecipesState(updater);
  }, []);

  const setQuestions = useCallback((updater: (prev: Question[]) => Question[]) => {
    setQuestionsState(updater);
  }, []);

  const updateRecipe = useCallback((id: string, patch: Partial<Recipe>) => {
    setRecipesState(prev =>
      prev.map(r => (r.id === id ? { ...r, ...patch } : r))
    );
  }, []);

  const updateQuestion = useCallback((id: string, patch: Partial<Question>) => {
    setQuestionsState(prev =>
      prev.map(q => (q.id === id ? { ...q, ...patch } : q))
    );
  }, []);

  const addQuestion = useCallback((q: Question) => {
    setQuestionsState(prev => [...prev, q]);
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestionsState(prev => prev.filter(q => q.id !== id));
  }, []);

  const likeQuestion = useCallback((id: string) => {
    setQuestionsState(prev =>
      prev.map(q => (q.id === id ? { ...q, likes: q.likes + 1 } : q))
    );
  }, []);

  const dislikeQuestion = useCallback((id: string) => {
    setQuestionsState(prev =>
      prev.map(q => (q.id === id ? { ...q, dislikes: q.dislikes + 1 } : q))
    );
  }, []);

  return {
    recipes, questions,
    setRecipes, setQuestions,
    updateRecipe, updateQuestion,
    addQuestion, deleteQuestion,
    likeQuestion, dislikeQuestion,
  };
}
