import { useState } from 'react'
import Dishes from './Dishes'
import Week from './Week'
import Shopping from './Shopping'

const TABS = [
  { id: 'dishes',   label: 'Plats',    icon: '🍜' },
  { id: 'week',     label: 'Semaine',  icon: '📅' },
  { id: 'shopping', label: 'Courses',  icon: '🛒' },
]

const TITLES = {
  dishes:   '🍽️ Nos Plats',
  week:     '📅 La Semaine',
  shopping: '🛒 Liste de Courses',
}

export default function App() {
  const [tab, setTab] = useState('dishes')

  return (
    <>
      <header className="header">{TITLES[tab]}</header>
      <main className="content">
        {tab === 'dishes'   && <Dishes />}
        {tab === 'week'     && <Week />}
        {tab === 'shopping' && <Shopping />}
      </main>
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
