export interface Interview {
  id: string
  title?: string
  interviewDate?: string
  startTime: string
  endTime: string
  platform?: string
  guests?: string[]
  color: string
  applicationId?: string
  interviewerId?: string
  bookedById?: string
  applicant: string
  interviewer: string
  bookedBy: string
}
