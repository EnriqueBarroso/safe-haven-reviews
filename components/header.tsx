"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut, User, ShieldAlert, Menu, X, Bell, CheckCircle2, MessageSquare } from "lucide-react"

const ADMIN_EMAIL = "enrique.barroso84@gmail.com"

// --- COMPONENTE DE LA CAMPANITA Y DESPLEGABLE ---
function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // Creamos un nombre de canal único para que las versiones móvil/desktop no colisionen
    const uniqueChannelName = `notifications_${userId}_${Math.random()}`

    // Suscripción en tiempo real a nuevas notificaciones
    const channel = supabase
      .channel(uniqueChannelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setUnreadCount(prev => prev + 1)
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    // Cerrar el dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userId])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Marcar como leída
    if (!notification.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n))
    }
    setIsOpen(false)

    // Navegar al perfil donde está la reseña o pregunta original
    router.push(`/profiles/${notification.target_slug}`)
  }

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors flex items-center justify-center"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-background border border-border shadow-xl rounded-xl overflow-hidden z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-secondary/30">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No tienes notificaciones nuevas</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b last:border-0 cursor-pointer hover:bg-secondary/50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm">
                      <MessageSquare className="h-3 w-3 inline mr-1 text-muted-foreground" />
                      Alguien ha respondido a tu {notif.type === 'reply_review' ? 'reseña' : 'mensaje'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
// --- FIN COMPONENTE DE NOTIFICACIONES ---

export function Header() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const isAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/yafui-logo-compact.png" alt="YaFui" className="h-12 w-auto md:hidden" />
          <img src="/yafui-logo.png" alt="YaFui" className="h-12 w-auto hidden md:block" />
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">Inicio</Link>
          <Link href="/profiles" className="text-sm font-medium text-muted-foreground hover:text-primary">Explorar</Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary">Cómo Funciona</Link>
        </nav>

        {/* BOTONES DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoading && (
            <>
              {session ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button variant="destructive" size="sm" asChild className="gap-1">
                      <Link href="/admin"><ShieldAlert className="h-4 w-4" /><span>Admin</span></Link>
                    </Button>
                  )}
                  {/* AQUÍ VA LA CAMPANA EN DESKTOP */}
                  <NotificationBell userId={session.user.id} />

                  <Button variant="outline" size="sm" asChild className="gap-2 border-primary/20 hover:bg-primary/10">
                    <Link href="/dashboard"><User className="h-4 w-4 text-primary" /><span className="font-semibold">Mi Panel</span></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} title="Cerrar Sesión" className="hover:text-destructive">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild><Link href="/auth/signin">Entrar</Link></Button>
                  <Button size="sm" asChild><Link href="/auth/register">Registrarse</Link></Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA Y CAMPANA MÓVIL */}
        <div className="flex md:hidden items-center gap-1">
          {!isLoading && session && (
            // AQUÍ VA LA CAMPANA EN MÓVIL (siempre visible aunque el menú esté cerrado)
            <NotificationBell userId={session.user.id} />
          )}
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full border-b bg-background shadow-lg px-4 py-6 flex flex-col gap-4 z-50">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-secondary/50 rounded-md">Inicio</Link>
          <Link href="/profiles" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-secondary/50 rounded-md">Explorar Reseñas</Link>
          <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-secondary/50 rounded-md">Cómo Funciona</Link>

          <hr className="my-2 border-border/50" />

          {!isLoading && (
            <div className="flex flex-col gap-2">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 text-lg font-medium text-primary hover:bg-primary/10 rounded-md">
                    <User className="h-5 w-5" /> Mi Panel
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 text-lg font-medium text-destructive hover:bg-destructive/10 rounded-md">
                      <ShieldAlert className="h-5 w-5" /> Moderación Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center gap-2 p-2 text-lg font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md text-left w-full mt-2">
                    <LogOut className="h-5 w-5" /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button variant="outline" asChild className="w-full justify-center h-12">
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>Entrar</Link>
                  </Button>
                  <Button asChild className="w-full justify-center h-12">
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>Registrarse</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}