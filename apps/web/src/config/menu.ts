import {
    Home,
    Users,
    Building2,
    LucideIcon
} from 'lucide-react'

type MenuItemType = {
    title: string
    url: string
    external?: string
    icon?: LucideIcon
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

export const mainMenu: MenuType = [
    {
        title: 'Home',
        url: '/',
        icon: Home
    },
    {
        title: 'Clientes',
        url: '/clientes',
        icon: Users
    },
    {
        title: 'Imóveis',
        url: '/imoveis',
        icon: Building2
    }
]
