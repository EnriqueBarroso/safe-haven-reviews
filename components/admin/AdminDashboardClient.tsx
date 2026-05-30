"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  deleteReview, dismissReport, deleteQuestion,
  suspendUser, unsuspendUser, deleteUserAndContent,
  deleteProfile, updateProfile,
  type ProfileUpdateData,
} from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Trash2, CheckCircle, AlertCircle, MessageSquare,
  Loader2, Users, ShieldOff, ShieldCheck, UserX,
  LayoutList, Search, ExternalLink, MapPin, Pencil, X, Check,
} from "lucide-react"

// ── Tipos ─────────────────────────────────────────────────────
type ProfileRef   = { name: string; id: string }
type ReviewRef    = { id: string; details: string; overall: number; profiles: ProfileRef | null }
type Report       = { id: string; reason: string; details: string; created_at: string; reviews: ReviewRef | null }
type QuestionRef  = { id: string; alias: string; details: string; created_at: string; parent_id: string | null; profiles: { name: string; city: string } | null }
type AdminUser    = {
  id: string; email: string; alias: string | null
  created_at: string; banned_until: string | null
  reviewCount: number; questionCount: number
}
type ProfileAdmin = {
  id: string; name: string; city: string; slug: string
  category: string | null; service_type: string | null
  price_range: string | null; platform_url: string | null
  image_url: string | null; tags: string[]
  created_at: string; reviewCount: number; questionCount: number
  address: string | null; lat: number | null; lng: number | null
}

interface Props {
  initialReports:   Report[]
  initialQuestions: QuestionRef[]
  initialUsers:     AdminUser[]
  usersError:       string | null
  initialProfiles:  ProfileAdmin[]
}

function isBanned(user: AdminUser) {
  return !!user.banned_until && new Date(user.banned_until) > new Date()
}

export function AdminDashboardClient({
  initialReports,
  initialQuestions,
  initialUsers,
  usersError,
  initialProfiles,
}: Props) {
  const [reports,       setReports]       = useState<Report[]>(initialReports)
  const [questions,     setQuestions]     = useState<QuestionRef[]>(initialQuestions)
  const [users,         setUsers]         = useState<AdminUser[]>(initialUsers)
  const [profiles,       setProfiles]      = useState<ProfileAdmin[]>(initialProfiles)
  const [profileSearch,  setProfileSearch] = useState("")
  const [editingId,      setEditingId]     = useState<string | null>(null)
  const [editForm,       setEditForm]      = useState<ProfileUpdateData>({
    name: "", city: "", address: "", category: "",
    service_type: "", price_range: "", platform_url: "",
    image_url: "", tags: [],
  })
  const [tagsInput,      setTagsInput]     = useState("")
  const [isPending,      startTransition]  = useTransition()
  const [activeId,       setActiveId]      = useState<string | null>(null)

  // ── Reportes ──────────────────────────────────────────────
  const handleDismissReport = (reportId: string) => {
    if (!window.confirm("¿Ignorar este reporte?")) return
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    setActiveId(reportId)
    startTransition(async () => {
      const { error } = await dismissReport(reportId)
      if (error) { setReports(initialReports); alert("Error: " + error) }
      setActiveId(null)
    })
  }

  const handleDeleteReview = (reportId: string, reviewId: string) => {
    if (!window.confirm("¿Borrar esta reseña? Es irreversible.")) return
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    setActiveId(reportId)
    startTransition(async () => {
      const { error } = await deleteReview(reportId, reviewId)
      if (error) { setReports(initialReports); alert("Error: " + error) }
      setActiveId(null)
    })
  }

  // ── Foro ──────────────────────────────────────────────────
  const handleDeleteQuestion = (questionId: string) => {
    if (!window.confirm("¿Borrar esta entrada del foro? Se borrarán también todas sus respuestas.")) return
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    setActiveId(questionId)
    startTransition(async () => {
      const { error } = await deleteQuestion(questionId)
      if (error) { setQuestions(initialQuestions); alert("Error: " + error) }
      setActiveId(null)
    })
  }

  // ── Usuarios ──────────────────────────────────────────────
  const handleSuspend = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    const banned = isBanned(user)
    const msg = banned
      ? `¿Reactivar la cuenta de ${user.email}?`
      : `¿Suspender la cuenta de ${user.email}? El usuario no podrá iniciar sesión.`
    if (!window.confirm(msg)) return

    setActiveId(userId)
    startTransition(async () => {
      const { error } = banned
        ? await unsuspendUser(userId)
        : await suspendUser(userId)
      if (error) {
        alert("Error: " + error)
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, banned_until: banned ? null : new Date(Date.now() + 876600 * 3600 * 1000).toISOString() }
              : u
          )
        )
      }
      setActiveId(null)
    })
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    if (!window.confirm(
      `¿Eliminar la cuenta de ${user.email} y TODO su contenido?\n\n` +
      `Se borrarán ${user.reviewCount} reseñas y ${user.questionCount} hilos. Esta acción es IRREVERSIBLE.`
    )) return

    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setActiveId(userId)
    startTransition(async () => {
      const { error } = await deleteUserAndContent(userId)
      if (error) { setUsers(initialUsers); alert("Error al eliminar usuario: " + error) }
      setActiveId(null)
    })
  }

  // ── Perfiles ──────────────────────────────────────────────
  const handleDeleteProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return
    if (!window.confirm(
      `¿Eliminar el perfil de ${profile.name} (${profile.city}) y TODO su contenido?\n\n` +
      `Se borrarán ${profile.reviewCount} reseñas y ${profile.questionCount} hilos. Esta acción es IRREVERSIBLE.`
    )) return

    setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    setActiveId(profileId)
    startTransition(async () => {
      const { error } = await deleteProfile(profileId)
      if (error) { setProfiles(initialProfiles); alert("Error al eliminar perfil: " + error) }
      setActiveId(null)
    })
  }

  const handleEditProfile = (p: ProfileAdmin) => {
    setEditingId(p.id)
    const t = { ...p.tags }
    setEditForm({
      name:         p.name          ?? "",
      city:         p.city          ?? "",
      address:      p.address       ?? "",
      category:     p.category      ?? "",
      service_type: p.service_type  ?? "",
      price_range:  p.price_range   ?? "",
      platform_url: p.platform_url  ?? "",
      image_url:    p.image_url     ?? "",
      tags:         p.tags          ?? [],
    })
    setTagsInput((p.tags ?? []).join(", "))
  }

  const handleSaveProfile = (profileId: string) => {
    const finalTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const data: ProfileUpdateData = { ...editForm, tags: finalTags }
    setActiveId(profileId)
    startTransition(async () => {
      const { error } = await updateProfile(profileId, data)
      if (error) {
        alert("Error al guardar el perfil: " + error)
      } else {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  name:         data.name         || p.name,
                  city:         data.city         || p.city,
                  address:      data.address      || null,
                  category:     data.category     || null,
                  service_type: data.service_type || null,
                  price_range:  data.price_range  || null,
                  platform_url: data.platform_url || null,
                  image_url:    data.image_url    || null,
                  tags:         finalTags,
                }
              : p
          )
        )
        setEditingId(null)
      }
      setActiveId(null)
    })
  }

  const filteredProfiles = profileSearch.trim()
    ? profiles.filter(
        (p) =>
          p.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
          p.city.toLowerCase().includes(profileSearch.toLowerCase())
      )
    : profiles

  return (
    <Tabs defaultValue="reports" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Reportes</span>
          <span>({reports.length})</span>
        </TabsTrigger>
        <TabsTrigger value="forum" className="gap-1.5 text-xs sm:text-sm">
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Foro</span>
          <span>({questions.length})</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
          <Users className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Usuarios</span>
          <span>({users.length})</span>
        </TabsTrigger>
        <TabsTrigger value="profiles" className="gap-1.5 text-xs sm:text-sm">
          <LayoutList className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Perfiles</span>
          <span>({profiles.length})</span>
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
                    variant="outline" size="sm"
                    disabled={isPending && activeId === report.id}
                    onClick={() => handleDismissReport(report.id)}
                  >
                    {isPending && activeId === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ignorar"}
                  </Button>
                  <Button
                    variant="destructive" size="sm"
                    disabled={!report.reviews || (isPending && activeId === report.id)}
                    onClick={() => report.reviews && handleDeleteReview(report.id, report.reviews.id)}
                  >
                    {isPending && activeId === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Borrar Reseña"}
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
                    <span className="text-[10px] text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                    {q.parent_id && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Respuesta</span>}
                  </div>
                  <p className="text-sm line-clamp-2">{q.details}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Perfil: <span className="text-foreground font-medium">{q.profiles?.name}</span> ({q.profiles?.city})
                  </p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={isPending && activeId === q.id}
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  {isPending && activeId === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* ── Usuarios ── */}
      <TabsContent value="users" className="space-y-4">
        {usersError ? (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">No se pueden cargar usuarios</p>
              <p className="opacity-80">{usersError}</p>
              <p className="mt-2 opacity-70 text-xs">
                Añade <code className="bg-destructive/10 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> en
                las variables de entorno de Vercel (sin prefijo NEXT_PUBLIC_).
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">No hay usuarios registrados.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const banned     = isBanned(u)
              const isActingOn = isPending && activeId === u.id
              return (
                <Card key={u.id} className={`overflow-hidden transition-colors ${banned ? "border-amber-300/50 bg-amber-50/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 font-semibold text-sm text-muted-foreground border">
                          {(u.alias || u.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">
                              {u.alias ?? <span className="text-muted-foreground italic">Sin alias</span>}
                            </span>
                            {banned && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] py-0">Suspendido</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(u.created_at).toLocaleDateString("es-ES")} · {u.reviewCount} reseña{u.reviewCount !== 1 ? "s" : ""} · {u.questionCount} hilo{u.questionCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline" size="sm"
                          className={`gap-1.5 ${banned ? "text-green-600 border-green-300 hover:bg-green-50" : "text-amber-600 border-amber-300 hover:bg-amber-50"}`}
                          disabled={isActingOn}
                          onClick={() => handleSuspend(u.id)}
                        >
                          {isActingOn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : banned
                            ? <><ShieldCheck className="h-3.5 w-3.5" /> Reactivar</>
                            : <><ShieldOff className="h-3.5 w-3.5" /> Suspender</>
                          }
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-destructive hover:bg-destructive/10 gap-1.5"
                          disabled={isActingOn}
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          {isActingOn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><UserX className="h-3.5 w-3.5" /> Eliminar</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>

      {/* ── Perfiles ── */}
      <TabsContent value="profiles" className="space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={profileSearch}
            onChange={(e) => setProfileSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredProfiles.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
            {profileSearch ? "Sin resultados para esa búsqueda." : "No hay perfiles en la base de datos."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((p) => {
              const isActingOn = isPending && activeId === p.id
              return (
                <Card key={p.id} className="overflow-hidden hover:border-border transition-colors">
                  <CardContent className="p-4 space-y-3">
                    {/* Fila principal */}
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="h-14 w-14 rounded-lg overflow-hidden border bg-secondary shrink-0 flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {p.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-muted-foreground text-sm">— {p.city}</span>
                          {p.category && (
                            <Badge variant="outline" className="text-[10px] py-0 capitalize">{p.category}</Badge>
                          )}
                          {p.service_type && (
                            <Badge variant="secondary" className="text-[10px] py-0 capitalize">{p.service_type}</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {p.reviewCount} reseña{p.reviewCount !== 1 ? "s" : ""}
                          {" · "}
                          {p.questionCount} hilo{p.questionCount !== 1 ? "s" : ""}
                          {" · "}
                          Creado {new Date(p.created_at).toLocaleDateString("es-ES")}
                        </p>
                        {p.address && (
                          <p className="text-[11px] text-primary/70 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {p.address}
                            {p.lat && <span className="text-green-600 ml-1">✓ geo</span>}
                          </p>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="gap-1.5" asChild>
                          <Link href={`/profiles/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" /> Ver
                          </Link>
                        </Button>
                        <Button
                          variant="outline" size="sm" className="gap-1.5"
                          onClick={() => editingId === p.id ? setEditingId(null) : handleEditProfile(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-destructive hover:bg-destructive/10 gap-1.5"
                          disabled={isActingOn}
                          onClick={() => handleDeleteProfile(p.id)}
                        >
                          {isActingOn
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <><Trash2 className="h-3.5 w-3.5" /> Eliminar</>
                          }
                        </Button>
                      </div>
                    </div>

                    {/* Formulario inline de edición completa */}
                    {editingId === p.id && (
                      <div className="pt-3 border-t space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Nombre</Label>
                            <Input
                              autoFocus
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Ciudad</Label>
                            <Input
                              value={editForm.city}
                              onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Categoría</Label>
                            <Select
                              value={editForm.category}
                              onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Selecciona..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mujer">Mujer</SelectItem>
                                <SelectItem value="trans">Trans</SelectItem>
                                <SelectItem value="pareja">Pareja</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo de servicio</Label>
                            <Select
                              value={editForm.service_type}
                              onValueChange={(v) => setEditForm((f) => ({ ...f, service_type: v }))}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Selecciona..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piso">Piso</SelectItem>
                                <SelectItem value="agencia">Agencia</SelectItem>
                                <SelectItem value="club">Club</SelectItem>
                                <SelectItem value="independiente">Independiente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Rango de precio</Label>
                            <Select
                              value={editForm.price_range}
                              onValueChange={(v) => setEditForm((f) => ({ ...f, price_range: v }))}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Selecciona..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="económico">Económico</SelectItem>
                                <SelectItem value="medio">Medio</SelectItem>
                                <SelectItem value="alto">Alto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">URL del anuncio</Label>
                            <Input
                              type="url"
                              value={editForm.platform_url}
                              onChange={(e) => setEditForm((f) => ({ ...f, platform_url: e.target.value }))}
                              placeholder="https://..."
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">URL de la imagen</Label>
                            <Input
                              type="url"
                              value={editForm.image_url}
                              onChange={(e) => setEditForm((f) => ({ ...f, image_url: e.target.value }))}
                              placeholder="https://..."
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Dirección{" "}
                              <span className="font-normal text-muted-foreground">(se geocodificará)</span>
                            </Label>
                            <Input
                              value={editForm.address}
                              onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                              placeholder="Calle, barrio o zona aproximada"
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">
                            Tags{" "}
                            <span className="font-normal text-muted-foreground">(separados por coma)</span>
                          </Label>
                          <Input
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Activa, Grande, Operada..."
                            className="text-sm"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                          </Button>
                          <Button
                            size="sm" className="gap-1.5"
                            disabled={isPending && activeId === p.id}
                            onClick={() => handleSaveProfile(p.id)}
                          >
                            {isPending && activeId === p.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <><Check className="h-3.5 w-3.5" /> Guardar cambios</>
                            }
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
