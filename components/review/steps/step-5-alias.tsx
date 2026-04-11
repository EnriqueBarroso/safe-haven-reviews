"use client"

import { StarRating } from "@/components/star-rating"
import { Shield, User, MapPin, Check } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step5Props {
  formData: ReviewFormData
}

export function Step5Alias({ formData }: Step5Props) {
  const averageRating = (
    (formData.veracity +
      formData.punctuality +
      formData.communication +
      formData.hygiene +
      formData.overall) /
    5
  ).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Summary</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your submission before publishing
        </p>
      </div>

      {/* Alias Display */}
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Your review will be published as</p>
        <p className="mt-2 text-2xl font-bold text-primary">{formData.alias}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          This pseudonym protects your identity while maintaining review authenticity
        </p>
      </div>

      {/* Review Preview */}
      <div className="space-y-4">
        <h3 className="font-medium">Review Preview</h3>
        
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          {/* Profile being reviewed */}
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">{formData.name || "Profile Name"}</h4>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{formData.city || "City"}</span>
              </div>
            </div>
          </div>

          {/* Ratings summary */}
          <div className="grid grid-cols-2 gap-4 border-b border-border py-4 text-sm md:grid-cols-5">
            <div>
              <p className="text-muted-foreground">Veracity</p>
              <div className="mt-1 flex items-center gap-1">
                <StarRating rating={formData.veracity} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Punctuality</p>
              <div className="mt-1 flex items-center gap-1">
                <StarRating rating={formData.punctuality} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Communication</p>
              <div className="mt-1 flex items-center gap-1">
                <StarRating rating={formData.communication} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Hygiene</p>
              <div className="mt-1 flex items-center gap-1">
                <StarRating rating={formData.hygiene} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Overall</p>
              <div className="mt-1 flex items-center gap-1">
                <StarRating rating={formData.overall} size="sm" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 border-b border-border py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Rating</span>
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(Number(averageRating))} size="sm" />
                <span className="font-semibold text-primary">{averageRating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price Paid</span>
              <span className="font-medium">{formData.price} EUR</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{formData.duration} minutes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Value Rating</span>
              <span className="font-medium">{formData.valuePrice}%</span>
            </div>
          </div>

          {/* Written review */}
          <div className="pt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {formData.details || "Your written review will appear here..."}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="text-sm">
          <p className="font-medium">Ready to publish</p>
          <p className="text-muted-foreground">
            Click &quot;Publish Review&quot; to submit your review to the community
          </p>
        </div>
      </div>
    </div>
  )
}
