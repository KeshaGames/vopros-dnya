import { useState, useCallback, useRef } from 'react';
import type { Recipe, Question, CardSlot, WeightGroup, CardAnimState, QuestionCategory } from '../types';
import { useStore } from '../store/useStore';
import Card from '../components/Card/Card';
import './GamePage.css';

// ── Algorithm helpers ──────────────────────────────────────────────

function recipeWeight(r: Recipe): number {
  return r.complexity + r.provocation + r.unexpectedness;
}

function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  if (!items.length) return null;
  const total = items.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

function pickQuestion(questions: Question[], recipe: Recipe, seenIds: Set<string>): Question | null {
  const pool = questions.filter(
    q =>
      q.complexity === recipe.complexity &&
      q.provocation === recipe.provocation &&
      q.unexpectedness === recipe.unexpectedness &&
      !seenIds.has(q.id)
  );
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function hasAvailableQuestion(questions: Question[], recipe: Recipe, seenIds: Set<string>): boolean {
  return questions.some(
    q =>
      q.complexity === recipe.complexity &&
      q.provocation === recipe.provocation &&
      q.unexpectedness === recipe.unexpectedness &&
      !seenIds.has(q.id)
  );
}

function pickSlot(
  recipes: Recipe[],
  questions: Question[],
  seenIds: Set<string>,
  usedRecipeIds: Set<string>,
  minW?: number,
  maxW?: number
): { recipe: Recipe; question: Question } | null {
  const pool = recipes.filter(
    r =>
      r.enabled &&
      !usedRecipeIds.has(r.id) &&
      (minW === undefined || recipeWeight(r) >= minW) &&
      (maxW === undefined || recipeWeight(r) <= maxW) &&
      hasAvailableQuestion(questions, r, seenIds)
  );
  const recipe = weightedRandom(pool);
  if (!recipe) return null;
  const question = pickQuestion(questions, recipe, seenIds);
  return question ? { recipe, question } : null;
}

const GROUPS: { group: WeightGroup; min: number; max: number }[] = [
  { group: 'low', min: 3, max: 4 },
  { group: 'mid', min: 5, max: 6 },
  { group: 'high', min: 7, max: 9 },
];

const ENTER_DELAYS = [0, 160, 320];
const FAN_X = [-150, 0, 150];

type GamePhase = 'start' | 'choosing' | 'selected';

const CATEGORIES: { id: QuestionCategory; label: string; emoji: string }[] = [
  { id: 'party',         label: 'Вечеринка',  emoji: '🎉' },
  { id: 'dating',        label: 'Свидание',   emoji: '❤️' },
  { id: 'philosophical', label: 'Философия',  emoji: '🔮' },
  { id: 'kids',          label: 'Для детей',  emoji: '🧸' },
];

// ── Component ─────────────────────────────────────────────────────

export default function GamePage() {
  const { recipes, questions, likeQuestion, dislikeQuestion } = useStore();
  const [cards, setCards] = useState<CardSlot[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [cardStates, setCardStates] = useState<CardAnimState[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [activeCategories, setActiveCategories] = useState<QuestionCategory[]>(['party', 'dating']);
  const [exhausted, setExhausted] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategories, setModalCategories] = useState<QuestionCategory[]>(['party', 'dating']);
  const [showNextButton, setShowNextButton] = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const toggleCategory = (cat: QuestionCategory) => {
    setActiveCategories(prev => {
      if (cat === 'kids') {
        if (prev.includes('kids')) {
          return prev.length === 1 ? prev : prev.filter(c => c !== 'kids');
        }
        return ['kids'];
      } else {
        if (prev.includes(cat)) {
          return prev.length === 1 ? prev : prev.filter(c => c !== cat);
        }
        return [...prev.filter(c => c !== 'kids'), cat];
      }
    });
  };

  const handleRestart = () => {
    setUsedQuestionIds(new Set());
    setExhausted(false);
    setGamePhase('start');
    setCards([]);
    setCardStates([]);
    setShowNextButton(false);
  };

  const openModal = () => {
    setModalCategories([...activeCategories]);
    setModalOpen(true);
  };

  const applyModal = () => {
    setActiveCategories(modalCategories);
    setModalOpen(false);
  };

  const toggleModalCategory = (cat: QuestionCategory) => {
    setModalCategories(prev => {
      if (cat === 'kids') {
        if (prev.includes('kids')) {
          return prev.length === 1 ? prev : prev.filter(c => c !== 'kids');
        }
        return ['kids'];
      } else {
        if (prev.includes(cat)) {
          return prev.length === 1 ? prev : prev.filter(c => c !== cat);
        }
        return [...prev.filter(c => c !== 'kids'), cat];
      }
    });
  };

  const drawCards = useCallback(() => {
    clearTimers();

    const filteredQs = questions.filter(q => activeCategories.includes(q.category));
    const remaining = filteredQs.filter(q => !usedQuestionIds.has(q.id));

    if (remaining.length === 0) {
      setExhausted(true);
      return;
    }

    const currentSeen = new Set(usedQuestionIds);
    const newCards: CardSlot[] = [];
    const usedRecipeIds = new Set<string>();

    for (const { group, min, max } of GROUPS) {
      let result = pickSlot(recipes, filteredQs, currentSeen, usedRecipeIds, min, max);
      if (!result) result = pickSlot(recipes, filteredQs, currentSeen, usedRecipeIds);
      if (result) {
        currentSeen.add(result.question.id);
        usedRecipeIds.add(result.recipe.id);
        newCards.push({ recipe: result.recipe, question: result.question, group });
      }
    }

    if (newCards.length === 0) {
      setExhausted(true);
      return;
    }

    setCards(newCards);
    setCardStates(newCards.map(() => 'entering' as CardAnimState));
    setGamePhase('choosing');
    setUsedQuestionIds(currentSeen);
    setDrawCount(c => c + 1);
    setShowNextButton(false);

    newCards.forEach((_, i) => {
      const t = setTimeout(() => {
        setCardStates(prev => {
          const next = [...prev];
          if (next[i] === 'entering') next[i] = 'resting';
          return next;
        });
      }, ENTER_DELAYS[i] + 820);
      timerRefs.current.push(t);
    });
  }, [recipes, questions, usedQuestionIds, activeCategories]);

  const handleSelect = useCallback((index: number) => {
    if (gamePhase !== 'choosing') return;
    setGamePhase('selected');
    setShowNextButton(false);

    const selectedX = FAN_X[index];
    const newStates: CardAnimState[] = cardStates.map((_, i) => {
      if (i === index) return 'centering';
      return FAN_X[i] < selectedX ? 'fly-left' : 'fly-right';
    });
    setCardStates(newStates);

    const t = setTimeout(() => {
      setCardStates(prev => prev.map((s, i) => (i === index ? 'flipped' : s)));
      const t2 = setTimeout(() => setShowNextButton(true), 850);
      timerRefs.current.push(t2);
    }, 550);
    timerRefs.current.push(t);
  }, [gamePhase, cardStates]);

  const filteredQsTotal = questions.filter(q => activeCategories.includes(q.category));
  const remainingCount = filteredQsTotal.filter(q => !usedQuestionIds.has(q.id)).length;
  const modalFilteredQsTotal = questions.filter(q => modalCategories.includes(q.category));

  const categoryToggles = (cats: QuestionCategory[], onToggle: (c: QuestionCategory) => void) =>
    CATEGORIES.map(cat => (
      <button
        key={cat.id}
        className={`category-btn category-btn--${cat.id}${cats.includes(cat.id) ? ' active' : ''}`}
        onClick={() => onToggle(cat.id)}
      >
        <span className="category-btn-emoji">{cat.emoji}</span>
        <span className="category-btn-label">{cat.label}</span>
      </button>
    ));

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-logo">🎲</div>
        <h1 className="game-title">Вопрос дня</h1>
        <p className="game-subtitle">Словесная игра для вечеринок и свиданий</p>
      </header>

      {exhausted ? (
        <div className="game-exhausted">
          <div className="game-exhausted-icon">🎉</div>
          <h2 className="game-exhausted-title">Вопросы закончились!</h2>
          <p className="game-exhausted-desc">
            Вы задали все {filteredQsTotal.length} вопросов из выбранных тематик.
          </p>
          <button className="game-btn-next" onClick={handleRestart}>
            Начать заново
          </button>
          <button className="game-change-cat-link" onClick={openModal}>
            Сменить категорию
          </button>
        </div>
      ) : gamePhase === 'start' ? (
        <>
          <div className="category-filters">
            {categoryToggles(activeCategories, toggleCategory)}
          </div>
          <div className="game-start">
            <p className="game-start-desc">
              Нажмите кнопку, чтобы получить три карточки с вопросами разной интенсивности.
              Выберите одну — и отвечайте честно!
            </p>
            <button className="game-btn-next" onClick={drawCards}>
              Начать игру
            </button>
            <p className="game-pool-hint">{filteredQsTotal.length} вопросов в выбранных тематиках</p>
          </div>
        </>
      ) : (
        <>
          <div className="fan-container">
            {cards.map((slot, i) => (
              <Card
                key={`${drawCount}-${i}`}
                slot={slot}
                cardIndex={i}
                animState={cardStates[i] ?? 'resting'}
                enterDelay={ENTER_DELAYS[i]}
                onSelect={() => handleSelect(i)}
                onLike={likeQuestion}
                onDislike={dislikeQuestion}
              />
            ))}
          </div>

          <div className="game-bottom">
            {showNextButton && (
              <div className="game-next-row">
                <button className="game-btn-next" onClick={drawCards}>
                  Следующий вопрос
                </button>
                <p className="game-pool-hint">{remainingCount} вопросов осталось</p>
              </div>
            )}
            <button className="game-change-cat-link" onClick={openModal}>
              Сменить категорию
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Тематики</h3>
            <div className="category-filters">
              {categoryToggles(modalCategories, toggleModalCategory)}
            </div>
            <p className="game-pool-hint">{modalFilteredQsTotal.length} вопросов в выбранных тематиках</p>
            <button className="game-btn-next" onClick={applyModal}>
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
