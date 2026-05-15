import { useState } from 'react'
import { useCollection, useDocument, setPlanningSlot } from './firebase'

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MEALS   = [{ key: 'midi', label: 'Midi' }, { key: 'soir', label: 'Soir' }]

function getWeekKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset * 7)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function getWeekDays(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset * 7)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(d)
    date.setDate(d.getDate() + i)
    return date
  })
}

function fmtDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function DishPicker({ dishes, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = dishes.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Choisir un plat</div>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <span className="search-icon">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            autoFocus
          />
        </div>

        <div
          className="dish-picker-item"
          onClick={() => onSelect(null)}
          style={{ color: 'var(--muted)', fontStyle: 'italic' }}
        >
          <span>✕</span> Aucun plat
        </div>

        {filtered.map(dish => (
          <div key={dish.id} className="dish-picker-item" onClick={() => onSelect(dish.id)}>
            <span className={`chip chip-${dish.category}`}>{dish.category}</span>
            <span style={{ flex: 1 }}>{dish.name}</span>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: 'var(--muted)', padding: '20px 0', textAlign: 'center' }}>
            Aucun plat trouvé
          </p>
        )}
      </div>
    </div>
  )
}

export default function Week() {
  const [offset, setOffset]   = useState(0)
  const [picking, setPicking] = useState(null)
  const dishes   = useCollection('dishes')
  const weekKey  = getWeekKey(offset)
  const planning = useDocument(`planning/${weekKey}`)
  const days     = getWeekDays(offset)

  const dishById = (id) => id ? dishes.find(d => d.id === id) : null

  const handleSlotClick = (slot) => {
    if (!dishes.length) {
      alert('Ajoutez d\'abord des plats dans l\'onglet "Plats" !')
      return
    }
    setPicking(slot)
  }

  const handleSelect = async (dishId) => {
    await setPlanningSlot(weekKey, picking, dishId ?? '')
    setPicking(null)
  }

  const weekLabel = (() => {
    if (offset === 0) return 'Cette semaine'
    if (offset === 1) return 'Semaine prochaine'
    if (offset === -1) return 'Semaine dernière'
    return `Semaine du ${fmtDate(days[0])}`
  })()

  return (
    <>
      <div className="week-nav">
        <button onClick={() => setOffset(o => o - 1)}>‹</button>
        <span className="week-label">{weekLabel}</span>
        <button onClick={() => setOffset(o => o + 1)}>›</button>
      </div>

      {days.map((date, i) => (
        <div key={i} className="day-card">
          <div className="day-header">
            <span>{DAYS_FR[i]}</span>
            <span className="day-date">{fmtDate(date)}</span>
          </div>
          {MEALS.map(meal => {
            const slot = `${DAYS_FR[i].toLowerCase()}_${meal.key}`
            const dish = dishById(planning?.[slot])
            return (
              <div key={meal.key} className="meal-slot" onClick={() => handleSlotClick(slot)}>
                <span className="meal-label">{meal.label}</span>
                <span className={`meal-value${dish ? '' : ' empty'}`}>
                  {dish ? dish.name : 'Appuyer pour choisir…'}
                </span>
                {dish && (
                  <span className={`chip chip-${dish.category}`}>{dish.category}</span>
                )}
                {dish && (
                  <button
                    className="meal-clear"
                    onClick={e => {
                      e.stopPropagation()
                      setPlanningSlot(weekKey, slot, '')
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {picking && (
        <DishPicker
          dishes={dishes}
          onSelect={handleSelect}
          onClose={() => setPicking(null)}
        />
      )}
    </>
  )
}
