"use client"

import {
  BackButton,
  CancelButton,
  CreateMemberButton,
} from "@/components/members/new/buttons"
import {
  CreateCustomerPageDescription,
  PaymentCapturePageDescription,
} from "@/components/members/new/description"
import { MemberShipDetailsCard } from "@/components/members/new/membership-details-card"
import PaymentCapturePage from "@/components/members/new/payment-capture-page"
import PersonalInformationCard from "@/components/members/new/personal-information-card"
import { TopBar } from "@/components/top-bar"
import { useBranch } from "@/components/utils"
import { createCustomerOptions } from "@/lib/query-options/customer"
import { CreateCustomer, CreateCustomerForm } from "@/lib/types/customer"
import { calculateNewDueDateFromPlan, defaultDateFormat } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import { ChangeEvent, createContext, useState } from "react"
import { toast } from "sonner"

const defaultformData: CreateCustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  startDate: format(new Date(), defaultDateFormat),
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
  const branch = useBranch()

  const createCustomerMutation = useMutation({
    ...createCustomerOptions(branch),
    onSuccess: (data) => {
      setFormData(defaultformData)
      setEmailPreviewLink(
        `${window.location.origin}/email-preview?id=${data.id}&name=${formData.firstName} ${formData.lastName}`
      )
      toast.success("Create Ezypay Customer successfully")
    },
  })

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

    const newStartDate =
      formData.startDate || format(new Date(), defaultDateFormat)
    const newDueDate: string = calculateNewDueDateFromPlan(
      formData.plan,
      newStartDate
    )

    const customerData: CreateCustomer = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      address: { address1: formData.address },
      mobilePhone: formData.emergencyContact,
      dateOfBirth: formData.dateOfBirth,
      homePhone: formData.phone,
      metadata: {
        plan: formData.plan,
        status: formData.status || "Trial",
        startDate: formData.startDate || format(new Date(), defaultDateFormat),
        dueDate: newDueDate,
      },
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
