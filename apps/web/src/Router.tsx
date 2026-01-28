import { Routes, Route, Outlet } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotMatch from './pages/NotMatch'
import Home from './pages/Home'
import Clients from './pages/Clients'
import ClientDetails from './pages/ClientDetails'
import Properties from './pages/Properties'
import Settings from './pages/Settings'
import Cartorios from './pages/Cartorios'
import StyleGuide from './pages/StyleGuide'

export default function Router() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route path="" element={<Home />} />
                    <Route path="clientes" element={<Clients />} />
                    <Route path="clientes/:id" element={<ClientDetails />} />
                    <Route path="imoveis" element={<Properties />} />
                    <Route path="configuracoes" element={<Settings />} />
                    <Route path="cadastros/cartorios" element={<Cartorios />} />
                    <Route path="style-guide" element={<StyleGuide />} />
                </Route>
                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}
