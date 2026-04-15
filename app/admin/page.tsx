"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, Trash2, CheckCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react"

// SUSTITUYE ESTO POR TU CORREO REAL DE ADMINISTRADOR
const ADMIN_EMAIL = "enrique.barroso84@gmail.com"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    setIsLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true)
      fetchPendingReports()
    } else {
      setIsAdmin(false)
      setIsLoading(false)
    }
  }

  const fetchPendingReports = async () => {
    // Traemos los reportes que estén pendientes, y cruzamos los datos 
    // para ver el texto de la reseña reportada y el nombre del perfil
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        reason,
        details,
        created_at,
        reviews (
          id,
          details,
          overall,
          profiles ( name, id )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReports(data)
    }
    setIsLoading(false)
  }

  // ACCIÓN 1: La reseña es tóxica, la borramos.
  const handleDeleteReview = async (reportId: string, reviewId: string) => {
    if (!window.confirm("¿Estás seguro? Borrar esta reseña es irreversible.")) return

    // Al borrar la reseña, el reporte se borrará automáticamente 
    // (gracias al ON DELETE CASCADE de la base de datos)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (!error) {
      // Actualizamos la pantalla quitando el reporte
      setReports(reports.filter(r => r.id !== reportId))
      alert("Reseña eliminada correctamente.")
    } else {
      alert("Error al borrar: " + error.message)
    }
  }

  // ACCIÓN 2: El reporte es falso o exagerado, lo descartamos.
  const handleDismissReport = async (reportId: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'dismissed' })
      .eq('id', reportId)

    if (!error) {
      setReports(reports.filter(r => r.id !== reportId))
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
  }

  // PANTALLA DE BLOQUEO PARA USUARIOS NORMALES
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center px-4">
        <ShieldAlert className="h-20 w-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-2">Acceso Restringido</h1>
        <p className="text-muted-foreground mb-8">Esta zona es exclusiva para la administración de ReviewSphere.</p>
        <Button asChild><Link href="/">Volver al inicio</Link></Button>
      </div>
    )
  }

  // PANTALLA DEL ADMINISTRADOR
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al portal
        </Link>
      </Button>

      <div className="flex items-center gap-4 mb-10 pb-6 border-b">
        <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Moderación</h1>
          <p className="text-muted-foreground">Gestiona los reportes de la comunidad para mantener la plataforma limpia.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Reportes Pendientes 
          <span className="bg-primary text-primary-foreground text-xs py-1 px-2 rounded-full">
            {reports.length}
          </span>
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-xl border border-dashed">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Todo está tranquilo</h3>
            <p className="text-muted-foreground">No hay reportes pendientes de revisión. ¡Buen trabajo de la comunidad!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="border-destructive/20 shadow-sm overflow-hidden">
                <div className="bg-destructive/5 px-6 py-3 border-b border-destructive/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <span className="font-bold text-destructive capitalize">
                      Motivo: {report.reason.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>
                
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Detalles del reporte */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detalles del Denunciante</p>
                    <p className="text-sm bg-secondary/50 p-3 rounded-md italic">
                      {report.details || "Sin detalles adicionales."}
                    </p>
                  </div>

                  {/* Reseña original que fue reportada */}
                  <div className="space-y-2 border-l pl-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Reseña Reportada (Perfil: <Link href={`/profiles/${report.reviews?.profiles?.id}`} className="text-primary hover:underline">{report.reviews?.profiles?.name}</Link>)
                    </p>
                    <div className="bg-background border p-3 rounded-md relative">
                      <div className="absolute top-2 right-2 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Nota: {report.reviews?.overall}/5
                      </div>
                      <p className="text-sm mt-4">"{report.reviews?.details}"</p>
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 py-4 bg-secondary/20 border-t flex justify-end gap-3">
                  <Button variant="outline" onClick={() => handleDismissReport(report.id)}>
                    Ignorar Reporte (Reseña OK)
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteReview(report.id, report.reviews.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Reseña Tóxica
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}