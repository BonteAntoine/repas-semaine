import { useState } from 'react'
import { useCollection, addDish, deleteDish, updateDish } from './firebase'

const CATEGORIES = ['Français', 'Coréen', 'Autre']

function AddDishSheet({ onClose }) {
  const [name, setName]     = useState('')
  const [cat, setCat]       = useState('Français')
  const [ings, setIngs]     = useState([{ name: '', qty: '', unit: '' }])

  const addIng = () => setIngs(p => [...p, { name: '', qty: '', unit: '' }])
  const delIng = (i) => setIngs(p => p.filter((_, j) => j !== i))
  const setIng = (i, field, val) =>
    setIngs(p => p.map((r, j) => j === i ? { ...r, [field]: val } : r))

  const handleSave = async () => {
    if (!name.trim()) return
    const ingredients = ings.filter(i => i.name.trim())
    await addDish({ name: name.trim(), category: cat, ingredients })
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Nouveau plat</div>

        <div className="form-group">
          <label>Nom du plat</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Bibimbap, Bœuf bourguignon…"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Ingrédients</label>
          {ings.map((ing, i) => (
            <div className="ing-row" key={i}>
              <input
                className="ing-name"
                value={ing.name}
                onChange={e => setIng(i, 'name', e.target.value)}
                placeholder="Ingrédient"
              />
              <input
                className="ing-qty"
                value={ing.qty}
                onChange={e => setIng(i, 'qty', e.target.value)}
                placeholder="Qté"
              />
              <input
                className="ing-unit"
                value={ing.unit}
                onChange={e => setIng(i, 'unit', e.target.value)}
                placeholder="Unité"
              />
              <button className="del-btn" onClick={() => delIng(i)}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addIng} style={{ marginTop: 4 }}>
            + Ajouter un ingrédient
          </button>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          Enregistrer
        </button>
      </div>
    </div>
  )
}

function EditDishSheet({ dish, onClose }) {
  const [name, setName]   = useState(dish.name)
  const [cat, setCat]     = useState(dish.category)
  const [ings, setIngs]   = useState(
    dish.ingredients?.length ? dish.ingredients : [{ name: '', qty: '', unit: '' }]
  )

  const addIng = () => setIngs(p => [...p, { name: '', qty: '', unit: '' }])
  const delIng = (i) => setIngs(p => p.filter((_, j) => j !== i))
  const setIng = (i, field, val) =>
    setIngs(p => p.map((r, j) => j === i ? { ...r, [field]: val } : r))

  const handleSave = async () => {
    if (!name.trim()) return
    const ingredients = ings.filter(i => i.name.trim())
    await updateDish(dish.id, { name: name.trim(), category: cat, ingredients })
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${dish.name}" ?`)) return
    await deleteDish(dish.id)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Modifier le plat</div>

        <div className="form-group">
          <label>Nom du plat</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Ingrédients</label>
          {ings.map((ing, i) => (
            <div className="ing-row" key={i}>
              <input
                className="ing-name"
                value={ing.name}
                onChange={e => setIng(i, 'name', e.target.value)}
                placeholder="Ingrédient"
              />
              <input
                className="ing-qty"
                value={ing.qty}
                onChange={e => setIng(i, 'qty', e.target.value)}
                placeholder="Qté"
              />
              <input
                className="ing-unit"
                value={ing.unit}
                onChange={e => setIng(i, 'unit', e.target.value)}
                placeholder="Unité"
              />
              <button className="del-btn" onClick={() => delIng(i)}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addIng} style={{ marginTop: 4 }}>
            + Ajouter un ingrédient
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
            Supprimer
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dishes() {
  const dishes  = useCollection('dishes')
  const [adding, setAdding]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch]   = useState('')

  const filtered = dishes.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(d => d.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un plat…"
        />
      </div>

      {dishes.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🍽️</div>
          <p>Aucun plat pour l'instant.<br />Appuyez sur + pour en ajouter !</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🔍</div>
          <p>Aucun résultat pour "{search}"</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="section-title">{cat}</div>
            {items.map(dish => (
              <div
                key={dish.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => setEditing(dish)}
              >
                <div className="dish-row">
                  <span className="dish-name">{dish.name}</span>
                  <span className={`chip chip-${cat}`}>{cat}</span>
                </div>
                {dish.ingredients?.length > 0 && (
                  <div className="ing-list" style={{ marginTop: 6 }}>
                    {dish.ingredients.map((ing, i) => (
                      <span key={i} className="ing-tag">
                        {ing.name}{ing.qty ? ` · ${ing.qty}${ing.unit ? ' ' + ing.unit : ''}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      <button className="fab" onClick={() => setAdding(true)}>+</button>

      {adding  && <AddDishSheet onClose={() => setAdding(false)} />}
      {editing && <EditDishSheet dish={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
