import type { Question } from '../../types';

interface Props {
  questions: Question[];
}

export default function StatsSection({ questions }: Props) {
  const topLiked = [...questions]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const topDisliked = [...questions]
    .sort((a, b) => b.dislikes - a.dislikes)
    .slice(0, 5);

  return (
    <div className="stats-section">
      <div className="stats-col">
        <h3 className="stats-col-title">👍 Топ-5 залайканных</h3>
        <ol className="stats-list">
          {topLiked.map(q => (
            <li key={q.id} className="stats-item">
              <span className="stats-item-text">{q.text}</span>
              <span className="stats-item-count like-count">{q.likes}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="stats-col">
        <h3 className="stats-col-title">👎 Топ-5 дизлайканных</h3>
        <ol className="stats-list">
          {topDisliked.map(q => (
            <li key={q.id} className="stats-item">
              <span className="stats-item-text">{q.text}</span>
              <span className="stats-item-count dislike-count">{q.dislikes}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
