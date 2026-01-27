import { Link } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { AppLogo } from './app-logo'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { baseUrl } from '@/config/app'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Settings } from 'lucide-react'

export function AppHeader() {
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const getUserInitials = () => {
        if (user?.name) {
            return user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (user?.email) {
            return user.email[0].toUpperCase()
        }
        return 'U'
    }

    const getUserDisplayName = () => {
        return user?.name || user?.email?.split('@')[0] || 'Usuário'
    }

    return (
        <header className="bg-background sticky top-0 z-50 border-b">
            <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between h-14 px-4 md:px-8">
                <div className='flex items-center gap-2'>
                    {/* <AppSidebar /> */}
                    <Link to="/">
                        <AppLogo />
                    </Link>
                </div>

                <div className='flex-1 flex items-center justify-end'>
                    <div className='flex-1'>
                        {/* <nav className="hidden md:flex gap-1">
                            {mainMenu.map((item, index) => (
                                (item.items && item.items.length > 0) ? (
                                    <DropdownMenu key={index}>
                                        <DropdownMenuTrigger className='focus-visible:outline-none'>
                                            <NavLink
                                                key={index}
                                                to={item.url}
                                                className={({ isActive }) => cn(
                                                    "flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left text-sm outline-none transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:size-4",
                                                    "h-8 text-sm hover:bg-accent hover:text-accent-foreground",
                                                    isActive ? "text-foreground bg-accent" : "text-foreground/70"
                                                )}>
                                                {item.icon && <item.icon />}
                                                <span className='font-medium'>{item.title}</span>
                                                <ChevronDown className='!size-3 -ml-1' />
                                            </NavLink>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='start' className='min-w-56'>
                                            {item.items.map((subItem, index) => (
                                                <DropdownMenuItem key={index} asChild>
                                                    <NavLink
                                                        to={subItem.url}
                                                        className={cn(
                                                            'cursor-pointer',
                                                            subItem.url === location.pathname && 'bg-muted'
                                                        )}>
                                                        {subItem.title}
                                                    </NavLink>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <NavLink
                                        key={index}
                                        to={item.url}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left text-sm outline-none transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:size-4",
                                            "h-8 text-sm hover:bg-accent hover:text-accent-foreground",
                                            isActive ? "text-foreground bg-accent" : "text-foreground/70"
                                        )}>
                                        {item.icon && <item.icon />}
                                        <span className='font-medium'>{item.title}</span>
                                    </NavLink>
                                )
                            ))}
                        </nav> */}
                    </div>
                    <nav className="flex gap-1 items-center">
                        {user && (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8'
                                                asChild>
                                                <Link to="/clientes">
                                                    <Users className='h-4 w-4' />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Clientes</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            className='relative h-8 w-8 rounded-full cursor-pointer ml-2'>
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage src={baseUrl + '/avatars/shadcn.jpg'} alt={getUserDisplayName()} />
                                                <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='w-56' align='end' forceMount>
                                        <DropdownMenuLabel className='font-normal'>
                                            <div className='flex flex-col space-y-1'>
                                                <p className='text-sm font-medium leading-none'>{getUserDisplayName()}</p>
                                                <p className='text-xs leading-none text-muted-foreground'>
                                                    {user.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/configuracoes" className="cursor-pointer">
                                                <Settings className="mr-2 size-4" />
                                                Configurações
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut}>
                                            Sair
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header >
    )
}