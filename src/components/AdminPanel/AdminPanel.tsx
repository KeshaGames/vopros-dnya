import { useState } from 'react';
import { useStore } from '../../store/useStore';
import RecipesTable from './RecipesTable';
import QuestionsTable from './QuestionsTable';
import StatsSection from './StatsSection';
import './AdminPanel.css';

type Tab = 'recipes' | 'questions' | 'stats';

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('recipes');
  const {
    recipes, questions,
    updateRecipe, updateQuestion,
    addQuestion, deleteQuestion,
  } = useStore();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <a href="/" className="admin-back-link">← Игра</a>
        <h1 className="admin-title">Администрирование</h1>
      </header>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'recipes' ? ' active' : ''}`}
          onClick={() => setTab('recipes')}
        >
          🗂 Рецепты <span className="tab-count">{recipes.length}</span>
        </button>
        <button
          className={`admin-tab${tab === 'questions' ? ' active' : ''}`}
          onClick={() => setTab('questions')}
        >
          ❓ Вопросы <span className="tab-count">{questions.length}</span>
        </button>
        <button
          className={`admin-tab${tab === 'stats' ? ' active' : ''}`}
          onClick={() => setTab('stats')}
        >
          📊 Статистика
        </button>
      </div>

      <div className="admin-content">
        {tab === 'recipes' && (
          <RecipesTable recipes={recipes} onUpdate={updateRecipe} />
        )}
        {tab === 'questions' && (
          <QuestionsTable
            questions={questions}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
            onAdd={addQuestion}
          />
        )}
        {tab === 'stats' && (
          <StatsSection questions={questions} />
        )}
      </div>
    </div>
  );
}
