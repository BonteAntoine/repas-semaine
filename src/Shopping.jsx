import { useState } from 'react'
import { useCollection, useDocument } from './firebase'

const DAYS_FR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const MEALS   = ['midi', 'soir']

function getWeekKey() {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export default function Shopping() {
  const dishes   = useCollection('dishes')
  const weekKey  = getWeekKey()
  const planning = useDocument(`planning/${weekKey}`)
  const [checked, setChecked] = useState({})

  const dishById = (id) => dishes.find(d => d.id === id)

  // Collect all dish IDs planned this week
  const plannedDishIds = new Set()
  if (planning) {
    DAYS_FR.forEach(day => {
      MEALS.forEach(meal => {
        const id = planning[`${day}_${meal}`]
        if (id) plannedDishIds.add(id)
      })
    })
  }

  // Aggregate ingredients grouped by category
  const ingredientsByDish = {}
  plannedDishIds.forEach(id => {
    const dish = dishById(id)
    if (!dish) return
    if (!ingredientsByDish[dish.category]) ingredientsByDish[dish.category] = {}
    ;(dish.ingredients || []).forEach(ing => {
      if (!ing.name) return
      const key = ing.name.toLowerCase()
      if (!ingredientsByDish[dish.category][key]) {
        ingredientsByDish[dish.category][key] = { name: ing.name, entries: [] }
      }
      ingredientsByDish[dish.category][key].entries.push({
        dish: dish.name,
        qty: ing.qty,
        unit: ing.unit,
      })
    })
  })

  const categories = Object.keys(ingredientsByDish)

  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }))
  const resetAll = () => setChecked({})

  if (dishes.length === 0 || !planning) {
    return (
      <div className="empty">
        <div className="empty-emoji">🛒</div>
        <p>Planifiez vos repas de la semaine<br />et la liste de courses apparaîtra ici.</p>
      </div>
    )
  }

  if (plannedDishIds.size === 0) {
    return (
      <div className="empty">
        <div className="empty-emoji">📅</div>
        <p>Aucun repas planifié cette semaine.<br />Allez dans "Semaine" pour en ajouter !</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="empty">
        <div className="empty-emoji">📝</div>
        <p>Vos plats planifiés n'ont pas d'ingrédients.<br />Modifiez-les dans "Plats" pour en ajouter.</p>
      </div>
    )
  }

  const doneCount  = Object.values(checked).filter(Boolean).length
  const totalCount = categories.reduce((n, cat) =>
    n + Object.keys(ingredientsByDish[cat]).length, 0)

  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>
          {doneCount}/{totalCount} articles cochés
        </span>
        {doneCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={resetAll}>
            Tout décocher
          </button>
        )}
      </div>

      {categories.map(cat => (
        <div key={cat} className="card shopping-section">
          <div className="section-title">
            <span className={`chip chip-${cat}`}>{cat}</span>
          </div>
          {Object.entries(ingredientsByDish[cat]).map(([key, ing]) => {
            const isDone = !!checked[key]
            const qtySummary = ing.entries
              .filter(e => e.qty)
              .map(e => `${e.qty}${e.unit ? ' ' + e.unit : ''} (${e.dish})`)
              .join(', ')
            return (
              <div
                key={key}
                className={`shop-item${isDone ? ' done' : ''}`}
                onClick={() => toggle(key)}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(key)}
                  onClick={e => e.stopPropagation()}
                />
                <span className="shop-text">{ing.name}</span>
                {qtySummary && (
                  <span className="shop-qty">{qtySummary}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}
