"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, User, ShieldAlert, Menu, X } from "lucide-react"


// SUSTITUYE POR TU CORREO REAL
const ADMIN_EMAIL = "enrique.barroso84@gmail.com"

export function Header() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // <-- ESTADO PARA EL MÓVIL

  useEffect(() => {
    // DESPUÉS
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Forzamos isLoading a false también aquí por si el evento
      // llega antes que la promesa de getSession
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMobileMenuOpen(false) // Cerramos menú al salir
    router.push("/")
    router.refresh()
  }

  const isAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">ReviewSphere</span>
        </Link>

        {/* NAVEGACIÓN DESKTOP (Se oculta en móvil) */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">Inicio</Link>
          <Link href="/profiles" className="text-sm font-medium text-muted-foreground hover:text-primary">Explorar</Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary">Cómo Funciona</Link>
        </nav>

        {/* BOTONES DESKTOP (Se ocultan en móvil) */}
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

        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <button
          className="flex md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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