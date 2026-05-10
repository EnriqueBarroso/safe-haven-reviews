"use client"

import { useState, useTransition } from "react"
import { deleteReview, dismissReport, deleteQuestion } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, CheckCircle, AlertCircle, MessageSquare, Loader2 } from "lucide-react"

type ProfileRef  = { name: string; id: string }
type ReviewRef   = { id: string; details: string; overall: number; profiles: ProfileRef | null }
type Report      = { id: string; reason: string; details: string; created_at: string; reviews: ReviewRef | null }
type QuestionRef = { id: string; alias: string; details: string; created_at: string; parent_id: string | null; profiles: { name: string; city: string } | null }

interface Props {
  initialReports:   Report[]
  initialQuestions: QuestionRef[]
}

export function AdminDashboardClient({ initialReports, initialQuestions }: Props) {
  const [reports,   setReports]   = useState<Report[]>(initialReports)
  const [questions, setQuestions] = useState<QuestionRef[]>(initialQuestions)
  const [isPending, startTransition] = useTransition()
  // ID de la fila cuya acción está en curso (para spinner individual)
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDismissReport = (reportId: string) => {
    // window.confirm debe llamarse FUERA de startTransition (es síncrono)
    if (!window.confirm("¿Ignorar este reporte?")) return

    // Actualización optimista: eliminamos de la UI antes de que responda el servidor
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    setActiveId(reportId)

    startTransition(async () => {
      const { error } = await dismissReport(reportId)
      if (error) {
        // Revertimos si el servidor falla
        setReports(initialReports)
        alert("Error al ignorar el reporte: " + error)
      }
      setActiveId(null)
    })
  }

  const handleDeleteReview = (reportId: string, reviewId: string) => {
    if (!window.confirm("¿Borrar esta reseña? Es irreversible.")) return

    setReports((prev) => prev.filter((r) => r.id !== reportId))
    setActiveId(reportId)

    startTransition(async () => {
      const { error } = await deleteReview(reportId, reviewId)
      if (error) {
        setReports(initialReports)
        alert("Error al borrar la reseña: " + error)
      }
      setActiveId(null)
    })
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm("¿Borrar esta entrada del foro? Se borrarán también todas sus respuestas.")) return

    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    setActiveId(questionId)

    startTransition(async () => {
      const { error } = await deleteQuestion(questionId)
      if (error) {
        setQuestions(initialQuestions)
        alert("Error al borrar la pregunta: " + error)
      }
      setActiveId(null)
    })
  }

  return (
    <Tabs defaultValue="reports" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="reports" className="gap-2">
          <AlertCircle className="h-4 w-4" /> Reportes ({reports.length})
        </TabsTrigger>
        <TabsTrigger value="forum" className="gap-2">
          <MessageSquare className="h-4 w-4" /> Foro ({questions.length})
        </TabsTrigger>
      </TabsList>

      {/* ── Reportes ── */}
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
                <p className="text-sm italic bg-muted p-3 rounded">&quot;{report.details}&quot;</p>
                <div className="border-l-4 border-primary/20 pl-4">
                  <p className="text-xs font-bold text-muted-foreground mb-1">RESEÑA REPORTADA:</p>
                  <p className="text-sm">&quot;{report.reviews?.details}&quot;</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending && activeId === report.id}
                    onClick={() => handleDismissReport(report.id)}
                  >
                    {isPending && activeId === report.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : "Ignorar"
                    }
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!report.reviews || (isPending && activeId === report.id)}
                    onClick={() => report.reviews && handleDeleteReview(report.id, report.reviews.id)}
                  >
                    {isPending && activeId === report.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : "Borrar Reseña"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* ── Foro ── */}
      <TabsContent value="forum" className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
            No hay entradas en el foro.
          </p>
        ) : (
          questions.map((q) => (
            <Card key={q.id} className="hover:border-amber-200 transition-colors">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-secondary rounded">{q.alias}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(q.created_at).toLocaleString()}
                    </span>
                    {q.parent_id && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Respuesta</span>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2">{q.details}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Perfil:{" "}
                    <span className="text-foreground font-medium">{q.profiles?.name}</span>{" "}
                    ({q.profiles?.city})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={isPending && activeId === q.id}
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  {isPending && activeId === q.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
