"use client"

import { StarRating } from "@/components/star-rating"
import { Camera, Clock, MessageCircle, Sparkles, Star } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step2Props {
  formData: ReviewFormData
  updateFormData: (updates: Partial<ReviewFormData>) => void
}

const ratingCategories = [
  {
    key: "veracity" as const,
    label: "Veracity / Photo Accuracy",
    description: "How accurate were the photos and profile description?",
    icon: Camera,
  },
  {
    key: "punctuality" as const,
    label: "Punctuality",
    description: "Were they on time and respectful of the schedule?",
    icon: Clock,
  },
  {
    key: "communication" as const,
    label: "Communication & Friendliness",
    description: "How was the communication before and during?",
    icon: MessageCircle,
  },
  {
    key: "hygiene" as const,
    label: "Hygiene & Environment",
    description: "Cleanliness and overall environment quality",
    icon: Sparkles,
  },
  {
    key: "overall" as const,
    label: "Overall Experience",
    description: "Your overall satisfaction with the experience",
    icon: Star,
  },
]

export function Step2Ratings({ formData, updateFormData }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Structured Ratings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rate each aspect of your experience (1-5 stars)
        </p>
      </div>

      <div className="space-y-6">
        {ratingCategories.map((category) => (
          <div
            key={category.key}
            className="rounded-lg border border-border bg-secondary/30 p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-13 sm:pl-0">
                <StarRating
                  rating={formData[category.key]}
                  size="lg"
                  interactive
                  onRatingChange={(rating) =>
                    updateFormData({ [category.key]: rating })
                  }
                />
                <span className="w-8 text-center text-sm font-medium text-muted-foreground">
                  {formData[category.key] > 0 ? `${formData[category.key]}/5` : "-"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {formData.veracity > 0 &&
        formData.punctuality > 0 &&
        formData.communication > 0 &&
        formData.hygiene > 0 &&
        formData.overall > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Average Rating</span>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={Math.round(
                    (formData.veracity +
                      formData.punctuality +
                      formData.communication +
                      formData.hygiene +
                      formData.overall) /
                      5
                  )}
                  size="md"
                />
                <span className="font-semibold text-primary">
                  {(
                    (formData.veracity +
                      formData.punctuality +
                      formData.communication +
                      formData.hygiene +
                      formData.overall) /
                    5
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
