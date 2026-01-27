import { Routes, Route, Outlet } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotMatch from './pages/NotMatch'
import Home from './pages/Home'

export default function Router() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route path="" element={<Home />} />
                </Route>
                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}
