"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Step1ProfileInfo } from "./steps/step-1-profile-info"
import { Step2Ratings } from "./steps/step-2-ratings"
import { Step3Details } from "./steps/step-3-details"
import { Step4Written } from "./steps/step-4-written"
import { Step5Alias } from "./steps/step-5-alias"
import { Check } from "lucide-react"

export interface ReviewFormData {
  // Step 1
  name: string
  city: string
  platform: string
  // Step 2
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  // Step 3
  valuePrice: number
  price: string
  duration: string
  // Step 4
  details: string
  genuineExperience: boolean
  // Step 5
  alias: string
}

const initialFormData: ReviewFormData = {
  name: "",
  city: "",
  platform: "",
  veracity: 0,
  punctuality: 0,
  communication: 0,
  hygiene: 0,
  overall: 0,
  valuePrice: 50,
  price: "",
  duration: "",
  details: "",
  genuineExperience: false,
  alias: "User" + Math.floor(Math.random() * 9000 + 1000),
}

const steps = [
  { title: "Profile Info", description: "Basic information" },
  { title: "Ratings", description: "Structured ratings" },
  { title: "Details", description: "Pricing & duration" },
  { title: "Written Review", description: "Your experience" },
  { title: "Confirmation", description: "Review alias" },
]

export function ReviewForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData)

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateFormData = (updates: Partial<ReviewFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData)
    // TODO: Implement draft saving
  }

  const handlePublish = () => {
    console.log("Publishing review:", formData)
    // TODO: Implement review submission
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.city.trim() !== ""
      case 1:
        return (
          formData.veracity > 0 &&
          formData.punctuality > 0 &&
          formData.communication > 0 &&
          formData.hygiene > 0 &&
          formData.overall > 0
        )
      case 2:
        return formData.price.trim() !== "" && formData.duration.trim() !== ""
      case 3:
        return formData.details.length >= 100 && formData.genuineExperience
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1ProfileInfo formData={formData} updateFormData={updateFormData} />
      case 1:
        return <Step2Ratings formData={formData} updateFormData={updateFormData} />
      case 2:
        return <Step3Details formData={formData} updateFormData={updateFormData} />
      case 3:
        return <Step4Written formData={formData} updateFormData={updateFormData} />
      case 4:
        return <Step5Alias formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground">{steps[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="mt-6 hidden gap-2 sm:flex">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-1 items-center gap-2 rounded-lg border p-3 transition-colors ${
                  index === currentStep
                    ? "border-primary bg-primary/10"
                    : index < currentStep
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-secondary/30"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-xs font-medium">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form content */}
      <Card>
        <CardContent className="p-6 md:p-8">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Continue
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={!canProceed()}>
              Publish Review
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
