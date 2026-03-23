// Used for sharing interface definitions across Main and Renderer processes
export interface TicketData {
  request_type: string
  request_title: string
  descriptionTemplate: string
  building: string
}
// phone_number: string