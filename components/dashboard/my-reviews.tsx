"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/star-rating"
import {
  MapPin,
  PenLine,
  Eye,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  FileEdit,
} from "lucide-react"

interface Review {
  id: string
  profileName: string
  profileCity: string
  status: "draft" | "pending" | "published"
  rating: number
  date: string
}

interface MyReviewsProps {
  reviews: Review[]
}

export function MyReviews({ reviews }: MyReviewsProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredReviews = reviews.filter((review) => {
    if (activeTab === "all") return true
    return review.status === activeTab
  })

  const counts = {
    all: reviews.length,
    published: reviews.filter((r) => r.status === "published").length,
    pending: reviews.filter((r) => r.status === "pending").length,
    draft: reviews.filter((r) => r.status === "draft").length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: Review["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="gap-1 bg-primary/20 text-primary hover:bg-primary/30">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="gap-1">
            <FileEdit className="h-3 w-3" />
            Draft
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>My Reviews</CardTitle>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/submit-review">
            <Plus className="h-4 w-4" />
            New Review
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-1.5">
              All
              <span className="text-xs text-muted-foreground">({counts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-1.5">
              Published
              <span className="text-xs text-muted-foreground">
                ({counts.published})
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              Pending
              <span className="text-xs text-muted-foreground">
                ({counts.pending})
              </span>
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-1.5">
              Drafts
              <span className="text-xs text-muted-foreground">({counts.draft})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Profile Initial */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {review.profileName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Review Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{review.profileName}</h3>
                          {getStatusBadge(review.status)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{review.profileCity}</span>
                          </div>
                          {review.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          )}
                          <span>{formatDate(review.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {review.status === "draft" && (
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <PenLine className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                      {review.status === "published" && (
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
