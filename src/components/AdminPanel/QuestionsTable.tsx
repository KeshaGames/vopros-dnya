import { useState } from 'react';
import type { Question, Axis, QuestionCategory } from '../../types';

interface Props {
  questions: Question[];
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onAdd: (q: Question) => void;
}

const EMPTY_FORM = {
  text: '',
  complexity: 1 as Axis,
  provocation: 1 as Axis,
  unexpectedness: 1 as Axis,
  category: 'party' as QuestionCategory,
};

export default function QuestionsTable({ questions, onUpdate, onDelete, onAdd }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
  };

  const commitEdit = (q: Question) => {
    if (editText.trim()) onUpdate(q.id, { text: editText.trim() });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!form.text.trim()) return;
    onAdd({
      id: `q-${Date.now()}`,
      text: form.text.trim(),
      complexity: form.complexity,
      provocation: form.provocation,
      unexpectedness: form.unexpectedness,
      likes: 0,
      dislikes: 0,
      category: form.category,
      source: 'user',
    });
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <span>{questions.length} вопросов</span>
        <button className="admin-btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Отмена' : '+ Добавить вопрос'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form">
          <textarea
            className="admin-form-textarea"
            placeholder="Текст вопроса…"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            rows={3}
          />
          <div className="admin-form-axes">
            {(['complexity', 'provocation', 'unexpectedness'] as const).map(axis => (
              <label key={axis} className="admin-form-axis">
                <span>{axis === 'complexity' ? 'Слож.' : axis === 'provocation' ? 'Пров.' : 'Неожид.'}</span>
                <select
                  value={form[axis]}
                  onChange={e => setForm(f => ({ ...f, [axis]: parseInt(e.target.value) as Axis }))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </label>
            ))}
          </div>
          <button className="admin-btn-save" onClick={handleAdd}>Сохранить</button>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Вопрос</th>
            <th title="Сложность">С</th>
            <th title="Провокационность">П</th>
            <th title="Неожиданность">Н</th>
            <th>👍</th>
            <th>👎</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id}>
              <td>
                {editingId === q.id ? (
                  <textarea
                    className="admin-inline-input"
                    value={editText}
                    autoFocus
                    rows={2}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => commitEdit(q)}
                    onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                  />
                ) : (
                  <span className="admin-q-text">{q.text}</span>
                )}
              </td>
              <td className="axis-cell">{q.complexity}</td>
              <td className="axis-cell">{q.provocation}</td>
              <td className="axis-cell">{q.unexpectedness}</td>
              <td className="stat-cell">{q.likes}</td>
              <td className="stat-cell">{q.dislikes}</td>
              <td className="actions-cell">
                <button className="admin-btn-edit" onClick={() => startEdit(q)}>✏</button>
                <button className="admin-btn-delete" onClick={() => onDelete(q.id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
