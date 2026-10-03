import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

function BottomNavWrapper() {
  const { pathname } = useLocation()

  // On cache la nav sur les conversations (le clavier + nav mangent tout l'ecran)
  if (pathname.startsWith('/conversation/')) {
    return null
  }

  return <BottomNav />
}

export default BottomNavWrapper
