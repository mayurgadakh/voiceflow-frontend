import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { authClient } from '../lib/authClient'
import { Logo } from './Logo'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

function UserMenu() {
  const { data: session } = authClient.useSession()
  const { theme, setTheme } = useTheme()
  const user = session?.user
  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs font-medium">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            {user.name}
            {user.role === 'admin' && <Badge variant="secondary">Admin</Badge>}
          </span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <Sun /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor /> System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => authClient.signOut()}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AppLayout() {
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user.role === 'admin'
  const links = isAdmin
    ? [
        { to: '/admin', label: 'Overview', end: true },
        { to: '/admin/feedback', label: 'Feedback', end: false },
      ]
    : [
        { to: '/', label: 'My feedback', end: true },
        { to: '/record', label: 'Record', end: false },
      ]

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link to={isAdmin ? '/admin' : '/'} aria-label="Voiceflow home">
            <Logo nameClassName="hidden sm:inline" />
          </Link>
          <nav className="flex items-center gap-1" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
