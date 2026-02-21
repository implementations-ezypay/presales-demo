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
