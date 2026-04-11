"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PenLine, Upload, AlertCircle } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step4Props {
  formData: ReviewFormData
  updateFormData: (updates: Partial<ReviewFormData>) => void
}

export function Step4Written({ formData, updateFormData }: Step4Props) {
  const charCount = formData.details.length
  const minChars = 100
  const isValid = charCount >= minChars

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Written Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share details about your experience to help others
        </p>
      </div>

      <div className="space-y-6">
        {/* Written Details */}
        <div className="space-y-2">
          <Label htmlFor="details" className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            Experience Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="details"
            placeholder="Describe the encounter professionally, focusing on service quality, communication, and overall experience. Be honest and respectful in your assessment..."
            value={formData.details}
            onChange={(e) => updateFormData({ details: e.target.value })}
            className="min-h-[200px] resize-none bg-secondary/50"
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isValid ? "text-muted-foreground" : "text-destructive"
              }
            >
              {charCount}/{minChars} characters minimum
            </span>
            {!isValid && charCount > 0 && (
              <span className="text-destructive">
                {minChars - charCount} more characters needed
              </span>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Review Guidelines</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Be professional and respectful in your language</li>
                <li>Focus on factual observations about the service</li>
                <li>Do not include personal identifying information</li>
                <li>Avoid explicit or inappropriate descriptions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verification Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            Verification Proof (Optional)
          </Label>
          <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50 hover:bg-secondary/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Upload proof for internal review (optional)
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                This will not be published publicly
              </p>
            </div>
          </div>
        </div>

        {/* Verification Checkbox */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="genuine"
              checked={formData.genuineExperience}
              onCheckedChange={(checked) =>
                updateFormData({ genuineExperience: checked === true })
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="genuine"
                className="cursor-pointer text-sm font-medium leading-relaxed"
              >
                I confirm this is a genuine experience{" "}
                <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                I swear this review is based on a real experience and I have no
                conflict of interest with the person being reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
