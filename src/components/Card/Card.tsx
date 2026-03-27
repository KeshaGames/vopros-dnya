import { useState } from 'react';
import type { CardSlot, CardAnimState } from '../../types';
import './Card.css';

const FAN_POSITIONS = [
  { x: -150, y: 30, r: -13 },
  { x: 0,    y: -8, r:   1 },
  { x: 150,  y: 30, r:  13 },
];

interface CardProps {
  slot: CardSlot;
  cardIndex: number;
  animState: CardAnimState;
  enterDelay: number;
  onSelect: () => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}

function AxisDots({ value, label }: { value: number; label: string }) {
  return (
    <div className="card-axis-row">
      <span className="card-axis-dots">
        {[1, 2, 3].map(i => (
          <span key={i} className={`card-axis-dot${i <= value ? ' active' : ''}`} />
        ))}
      </span>
      <span className="card-axis-label">{label}</span>
    </div>
  );
}

export default function Card({
  slot, cardIndex, animState, enterDelay, onSelect, onLike, onDislike,
}: CardProps) {
  const [voted, setVoted] = useState<'like' | 'dislike' | null>(null);
  const pos = FAN_POSITIONS[cardIndex] ?? FAN_POSITIONS[1];
  const isFlipped = animState === 'flipped';
  const isClickable = animState === 'resting';

  const cssVars = {
    '--fan-x': `${pos.x}px`,
    '--fan-y': `${pos.y}px`,
    '--fan-r': `${pos.r}deg`,
    '--enter-delay': `${enterDelay}ms`,
    '--card-z': String(cardIndex === 1 ? 3 : cardIndex === 0 ? 2 : 1),
  } as React.CSSProperties;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted) return;
    setVoted('like');
    onLike(slot.question.id);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted) return;
    setVoted('dislike');
    onDislike(slot.question.id);
  };

  return (
    <div
      className={`card-wrapper state-${animState}`}
      style={cssVars}
      onClick={isClickable ? onSelect : undefined}
    >
      <div className={`card-inner${isFlipped ? ' flipped' : ''}`}>
        <div className="card-face card-front">
          <div className="card-icon">{slot.recipe.icon}</div>
          <div lang="ru" className={`card-recipe-name${slot.recipe.name.length > 15 ? ' long-name' : ''}`}>{slot.recipe.name}</div>
          <div className="card-axes">
            <AxisDots value={slot.recipe.complexity}     label="Сложность" />
            <AxisDots value={slot.recipe.provocation}    label="Провокационность" />
            <AxisDots value={slot.recipe.unexpectedness} label="Неожиданность" />
          </div>
          <div className="card-tap-hint">Нажмите, чтобы открыть</div>
        </div>

        <div className="card-face card-back">
          <div className="card-question-text">{slot.question.text}</div>
          <div className="card-actions">
            <button className="card-btn-clarify">💬 Уточняющий вопрос</button>
            <div className="card-vote-row">
              <button
                className={`card-btn-vote like${voted ? ' voted' : ''}`}
                onClick={handleLike}
              >
                👍 {slot.question.likes + (voted === 'like' ? 1 : 0)}
              </button>
              <button
                className={`card-btn-vote dislike${voted ? ' voted' : ''}`}
                onClick={handleDislike}
              >
                👎 {slot.question.dislikes + (voted === 'dislike' ? 1 : 0)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
