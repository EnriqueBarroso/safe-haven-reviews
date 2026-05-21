"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, Calendar, MessageCircle, Reply } from "lucide-react"
import { ReportDialog } from "@/components/review/Reportdialog"
import { ReplyForm } from "./ReplyForm"
import type { TreeNode, TableType } from "@/lib/build-tree"

interface ThreadNodeProps {
  node: TreeNode
  table: TableType
  depth?: number
  profileId: string
  session: any
  onDataRefresh: () => void
  onImageClick: (url: string) => void
}

export function ThreadNode({
  node, table, depth = 0, profileId, session, onDataRefresh, onImageClick,
}: ThreadNodeProps) {
  const [isReplying, setIsReplying] = useState(false)

  const isQuestion = table === "questions" && depth === 0
  const isReply = depth > 0
  const hasRatings =
    (node.overall && node.overall > 0) ||
    (node.veracity && node.veracity > 0) ||
    (node.punctuality && node.punctuality > 0) ||
    (node.communication && node.communication > 0) ||
    (node.hygiene && node.hygiene > 0)

  const handleReplySuccess = () => {
    setIsReplying(false)
    onDataRefresh()
  }

  return (
    <div style={{ marginLeft: depth > 0 ? `${Math.min(depth, 4) * 24}px` : 0 }}>
      <Card
        className={`overflow-hidden transition-colors ${
          isReply
            ? "border-l-2 border-l-primary/30 border-t-0 border-r-0 border-b-0 rounded-none shadow-none bg-transparent"
            : isQuestion
              ? "border-amber-200/50 bg-amber-50/10"
              : "bg-card/50"
        }`}
      >
        <CardHeader className={`pb-3 ${
          isReply ? "px-4 pt-4" : isQuestion ? "bg-amber-500/5" : "bg-secondary/30"
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full flex items-center justify-center overflow-hidden font-bold text-xs border-2 shrink-0 ${
                  isQuestion
                    ? "border-amber-200 bg-amber-100 text-amber-700"
                    : "border-primary/20 bg-primary/10 text-primary"
                }`}
                style={{
                  height: isReply ? "2rem" : "2.5rem",
                  width: isReply ? "2rem" : "2.5rem",
                }}
              >
                {node.avatar_url ? (
                  <img src={node.avatar_url} alt={node.alias} className="h-full w-full object-cover" />
                ) : (
                  node.alias.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <CardTitle className={`${isReply ? "text-sm" : "text-base"} flex items-center gap-2`}>
                  {node.alias}
                  {isReply && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">respuesta</Badge>
                  )}
                  {isQuestion && !isReply && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200/50 bg-amber-50">
                      Pregunta al Foro
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(node.created_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {!isQuestion && node.overall && node.overall > 0 && (
                <div className="flex items-center gap-1 bg-background px-3 py-1 rounded-full shadow-sm border">
                  <span className="font-bold text-sm">{node.overall}/5</span>
                  <StarIcon className="h-3.5 w-3.5 fill-primary text-primary" />
                </div>
              )}
              <ReportDialog reviewId={node.id} />
            </div>
          </div>
        </CardHeader>

        <CardContent className={`pt-4 space-y-4 ${isReply ? "px-4 pb-3" : ""}`}>
          {/* Precio / duración — solo reseñas raíz */}
          {!isQuestion && !isReply && (node.price || node.duration) && (
            <div className="flex flex-wrap gap-4 text-sm bg-secondary/20 p-3 rounded-lg border border-border/50">
              {node.price && (
                <div><span className="text-muted-foreground">Pagado:</span> <span className="font-medium">{node.price}€</span></div>
              )}
              {node.duration && (
                <div><span className="text-muted-foreground">Duración:</span> <span className="font-medium">{node.duration} min</span></div>
              )}
            </div>
          )}

          {/* Valoraciones inline en respuestas */}
          {isReply && hasRatings && (
            <div className="flex flex-wrap gap-3 text-xs">
              {node.veracity && node.veracity > 0 && (
                <span className="flex items-center gap-1 bg-secondary/40 px-2 py-1 rounded">Veracidad: <strong>{node.veracity}/5</strong></span>
              )}
              {node.punctuality && node.punctuality > 0 && (
                <span className="flex items-center gap-1 bg-secondary/40 px-2 py-1 rounded">Puntualidad: <strong>{node.punctuality}/5</strong></span>
              )}
              {node.communication && node.communication > 0 && (
                <span className="flex items-center gap-1 bg-secondary/40 px-2 py-1 rounded">Comunicación: <strong>{node.communication}/5</strong></span>
              )}
              {node.hygiene && node.hygiene > 0 && (
                <span className="flex items-center gap-1 bg-secondary/40 px-2 py-1 rounded">Higiene: <strong>{node.hygiene}/5</strong></span>
              )}
            </div>
          )}

          {/* Texto */}
          <div className="relative">
            <MessageCircle className={`absolute -left-2 -top-2 h-8 w-8 ${isQuestion ? "text-amber-500/10" : "text-muted-foreground/10"}`} />
            <p className={`text-foreground/90 leading-relaxed text-sm whitespace-pre-line relative z-10 pl-4 border-l-2 ${isQuestion ? "border-amber-500/30" : "border-primary/20"}`}>
              {node.details}
            </p>
          </div>

          {/* Imágenes — solo reseñas raíz */}
          {!isQuestion && !isReply && node.review_images && node.review_images.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Fotos de la visita:</p>
              <div className="flex flex-wrap gap-2">
                {node.review_images.map((img: any) => (
                  <div
                    key={img.id}
                    onClick={() => onImageClick(img.image_url)}
                    className="relative h-20 w-20 rounded-md overflow-hidden border shadow-sm hover:opacity-80 transition-opacity cursor-zoom-in"
                  >
                    <img src={img.image_url} alt="Visita" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón Responder */}
          {session && !isReplying && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsReplying(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="h-3 w-3" />
                Responder
              </button>
            </div>
          )}

          {/* Formulario inline */}
          {isReplying && (
            <ReplyForm
              parentId={node.id}
              table={table}
              profileId={profileId}
              session={session}
              onSuccess={handleReplySuccess}
              onCancel={() => setIsReplying(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Hijos (recursivo) */}
      {node.children.length > 0 && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <ThreadNode
              key={child.id}
              node={child}
              table={table}
              depth={depth + 1}
              profileId={profileId}
              session={session}
              onDataRefresh={onDataRefresh}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}