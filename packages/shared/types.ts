// Used for sharing interface definitions across Main and Renderer processes
export interface TicketData {
  request_type: string
  request_title: string
  descriptionTemplate: string
  assigned_to: string
  phoneNumber?: string
  building?: string // ← the ? makes it optional
}

export interface PasswordData {
  password: string,
  staffID?: string,
  staff_username?: string
}