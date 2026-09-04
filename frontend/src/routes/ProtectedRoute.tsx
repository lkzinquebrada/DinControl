import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingScreen } from '../components/layout/LoadingScreen'

export function ProtectedRoute() {
  const { autenticado, carregando } = useAuth()

  if (carregando) {
    return <LoadingScreen atraso={0} />
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
