"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  MessageSquare, 
  AlertCircle 
} from "lucide-react"

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "enrique.barroso84@gmail.com"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    setIsLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true)
      await Promise.all([
        fetchPendingReports(),
        fetchRecentQuestions()
      ])
    }
    setIsLoading(false)
  }

  const fetchPendingReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, reason, details, created_at,
        reviews ( id, details, overall, profiles ( name, id ) )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) setReports(data)
  }

  const fetchRecentQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        profiles ( name, city )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) setQuestions(data)
  }

  const handleDeleteReview = async (reportId: string, reviewId: string) => {
    if (!window.confirm("¿Borrar esta reseña? Es irreversible.")) return
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (!error) setReports(reports.filter(r => r.id !== reportId))
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("¿Borrar esta entrada del foro? Se borrarán también todas sus respuestas.")) return
    const { error } = await supabase.from('questions').delete().eq('id', questionId)
    if (!error) setQuestions(questions.filter(q => q.id !== questionId))
  }

  const handleDismissReport = async (reportId: string) => {
    const { error } = await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
    if (!error) setReports(reports.filter(r => r.id !== reportId))
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center px-4">
        <ShieldAlert className="h-20 w-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-2">Acceso Restringido</h1>
        <Button asChild><Link href="/">Volver al inicio</Link></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* BOTÓN DE VOLVER ATRÁS */}
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al portal
        </Link>
      </Button>

      <header className="flex items-center gap-4 mb-10 pb-6 border-b">
        <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Moderación</h1>
          <p className="text-muted-foreground">Administración global de reseñas y foro.</p>
        </div>
      </header>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reports" className="gap-2">
            <AlertCircle className="h-4 w-4" /> Reportes ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Foro ({questions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {reports.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-xl border border-dashed">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay reportes de reseñas pendientes.</p>
            </div>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="border-destructive/20 overflow-hidden">
                <div className="bg-destructive/5 px-6 py-2 border-b text-xs font-bold text-destructive flex justify-between">
                  <span>MOTIVO: {report.reason.toUpperCase()}</span>
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm italic bg-muted p-3 rounded">" {report.details} "</p>
                  <div className="border-l-4 border-primary/20 pl-4">
                    <p className="text-xs font-bold text-muted-foreground mb-1">RESEÑA REPORTADA:</p>
                    <p className="text-sm">"{report.reviews?.details}"</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDismissReport(report.id)}>Ignorar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteReview(report.id, report.reviews.id)}>Borrar Reseña</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="forum" className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id} className="hover:border-amber-200 transition-colors">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-secondary rounded">{q.alias}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                    {q.parent_id && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Respuesta</span>}
                  </div>
                  <p className="text-sm line-clamp-2">{q.details}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Perfil: <span className="text-foreground font-medium">{q.profiles?.name}</span> ({q.profiles?.city})
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteQuestion(q.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}