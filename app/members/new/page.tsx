"use client"

import { TopBar } from "@/components/top-bar"
import { useState, useEffect, ChangeEvent, createContext } from "react"
import { useMutation } from "@tanstack/react-query"
import { createCustomerOptions } from "@/lib/query-options/customer"
import PersonalInformationCard from "@/components/members/new/personal-information-card"
import { MemberShipDetailsCard } from "@/components/members/new/membership-details-card"
import { CreateCustomerForm } from "@/lib/types/customer"
import PaymentCapturePage from "@/components/members/new/payment-capture-page"
import {
  CreateCustomerPageDescription,
  PaymentCapturePageDescription,
} from "@/components/members/new/description"
import {
  BackButton,
  CancelButton,
  CreateMemberButton,
} from "@/components/members/new/buttons"

const defaultformData: CreateCustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  startDate: "2020-01-01",
  plan: "trial",
  status: "trial",
}

type NewMemberContextType = {
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSelectChange: (key: "status" | "plan", value: string) => void
  formData: CreateCustomerForm
  branch: string
}

export const NewMemberContext = createContext<NewMemberContextType | undefined>(
  undefined
)

export default function NewMemberPage() {
  const [emailPreviewLink, setEmailPreviewLink] = useState("")
  const [formData, setFormData] = useState<CreateCustomerForm>(defaultformData)
  const [branch, setBranch] = useState("")

  const createCustomerMutation = useMutation({
    ...createCustomerOptions(branch),
    onSuccess: (data) => {
      setFormData(defaultformData)
      setEmailPreviewLink(
        `${window.location.origin}/email-preview?id=${data.id}&name=${formData.firstName} ${formData.lastName}`
      )
    },
  })

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const field = e.target.id
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSelectChange(key: "status" | "plan", value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const customerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      address: { address1: formData.address },
      mobilePhone: formData.emergencyContact,
      dateOfBirth: formData.dateOfBirth,
    }
    createCustomerMutation.mutate({ customerData })
  }

  return (
    <NewMemberContext.Provider
      value={{ formData, handleInputChange, handleSelectChange, branch }}
    >
      <div className="relative flex flex-col h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              {createCustomerMutation.isSuccess && (
                <BackButton
                  resetMutationState={() => createCustomerMutation.reset()}
                ></BackButton>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
                  Add New Member
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Create a new member profile
                </p>
                {createCustomerMutation.isIdle && (
                  <CreateCustomerPageDescription />
                )}
                {createCustomerMutation.isSuccess && (
                  <PaymentCapturePageDescription />
                )}
              </div>
            </div>
            {(createCustomerMutation.isIdle ||
              createCustomerMutation.isPending) && (
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <PersonalInformationCard />
                <MemberShipDetailsCard />

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                  <CancelButton />
                  <CreateMemberButton
                    isPending={createCustomerMutation.isPending}
                  />
                </div>
              </form>
            )}
            {createCustomerMutation.isSuccess && emailPreviewLink && (
              <PaymentCapturePage
                emailPreviewLink={emailPreviewLink}
                customerId={createCustomerMutation.data.id}
              />
            )}
          </div>
        </main>
      </div>
    </NewMemberContext.Provider>
  )
}
