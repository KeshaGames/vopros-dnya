import { useState } from 'react';
import type { Recipe } from '../../types';

interface Props {
  recipes: Recipe[];
  onUpdate: (id: string, patch: Partial<Recipe>) => void;
}

export default function RecipesTable({ recipes, onUpdate }: Props) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState('');

  const startEdit = (r: Recipe) => {
    setEditingName(r.id);
    setNameValue(r.name);
  };

  const commitEdit = (id: string) => {
    if (nameValue.trim()) onUpdate(id, { name: nameValue.trim() });
    setEditingName(null);
  };

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Название</th>
            <th title="Сложность">С</th>
            <th title="Провокационность">П</th>
            <th title="Неожиданность">Н</th>
            <th>Вес</th>
            <th>Вкл</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(r => (
            <tr key={r.id} className={r.enabled ? '' : 'row-disabled'}>
              <td>
                {editingName === r.id ? (
                  <input
                    className="admin-inline-input"
                    value={nameValue}
                    autoFocus
                    onChange={e => setNameValue(e.target.value)}
                    onBlur={() => commitEdit(r.id)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(r.id); if (e.key === 'Escape') setEditingName(null); }}
                  />
                ) : (
                  <span className="admin-editable-name" onClick={() => startEdit(r)}>
                    {r.name} <span className="edit-hint">✏</span>
                  </span>
                )}
              </td>
              <td className="axis-cell">{r.complexity}</td>
              <td className="axis-cell">{r.provocation}</td>
              <td className="axis-cell">{r.unexpectedness}</td>
              <td>
                <input
                  type="number"
                  className="admin-weight-input"
                  value={r.weight}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onChange={e => onUpdate(r.id, { weight: parseFloat(e.target.value) || 1 })}
                />
              </td>
              <td>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={e => onUpdate(r.id, { enabled: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
