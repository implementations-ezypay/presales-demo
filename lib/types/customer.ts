export type Customer = {
  id: string
  address?: {
    address1?: string
    address2?: string
    postalcode?: string
    state?: string
    countryCode?: string
    city?: string
  }
  dateOfBirth?: string
  email?: string
  firstName: string
  lastName: string
  mobilePhone?: string
  homePhone?: string
  metadata?: {
    plan?: string
    status?: string
    dueDate?: string
    startDate?: string
    originalBranch?: string
  }
  number?: string
}

export type CreateCustomer = Omit<Customer, "id">

export type CreateCustomerForm = {
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  startDate?: string
  plan?: MembershipPlan
  status?: MembershipStatus
  existingCustomerNumber?: string
  phone?: string
}

export type MembershipPlan =
  | "trial"
  | "basic"
  | "annual"
  | "premium"
  | "personal training"

export type MembershipStatus = "active" | "trial" | "expired"
