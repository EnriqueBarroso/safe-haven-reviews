"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StarRating } from "@/components/star-rating"
import { Flag, User, Euro, Clock } from "lucide-react"

interface Review {
  id: string
  alias: string
  date: string
  rating: number
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  price: number
  duration: number
  comment: string
}

interface ReviewsFeedProps {
  reviews: Review[]
}

export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  const [sortBy, setSortBy] = useState("date")

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "rating-high":
        return b.rating - a.rating
      case "rating-low":
        return a.rating - b.rating
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "date":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>User Reviews ({reviews.length})</CardTitle>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Most Recent</SelectItem>
            <SelectItem value="rating-high">Highest Rating</SelectItem>
            <SelectItem value="rating-low">Lowest Rating</SelectItem>
            <SelectItem value="price-high">Highest Price</SelectItem>
            <SelectItem value="price-low">Lowest Price</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-border bg-secondary/30 p-4"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{review.alias}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(review.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="font-semibold text-primary">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Compact ratings */}
            <div className="mt-4 grid grid-cols-5 gap-2 rounded-lg bg-muted/50 p-3 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Veracity</p>
                <p className="mt-1 font-semibold">{review.veracity}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Punctuality</p>
                <p className="mt-1 font-semibold">{review.punctuality}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Communication</p>
                <p className="mt-1 font-semibold">{review.communication}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Hygiene</p>
                <p className="mt-1 font-semibold">{review.hygiene}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Overall</p>
                <p className="mt-1 font-semibold">{review.overall}</p>
              </div>
            </div>

            {/* Price and Duration */}
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Euro className="h-3.5 w-3.5" />
                <span>{review.price} EUR</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{review.duration} min</span>
              </div>
            </div>

            {/* Comment */}
            <p className="mt-4 leading-relaxed text-foreground/90">
              {review.comment}
            </p>

            {/* Report button */}
            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
              >
                <Flag className="mr-1.5 h-3 w-3" />
                Report this review
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
