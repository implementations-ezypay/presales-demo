export type CreateCustomer = {
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  startDate: Number
  plan: string
  status: string
  existingCustomerNumber: string
}
