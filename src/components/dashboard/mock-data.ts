import { EnrollmentPoint } from "./EnrollmentTrajectory"

export interface KpiData {
  activeStudies: number
  totalEnrolled: number
  targetEnrolled: number
  saeReported: number
  complianceRate: number
  protocolDeviations: number
}

export const mockKpiData: KpiData = {
  activeStudies: 3,
  totalEnrolled: 14,
  targetEnrolled: 15,
  saeReported: 2,
  complianceRate: 94.2,
  protocolDeviations: 1,
}

export const mockEnrollmentTrajectory: EnrollmentPoint[] = [
  { date: "2026-08-04", enrolled: 3, target: 3 },
  { date: "2026-08-11", enrolled: 6, target: 6 },
  { date: "2026-08-18", enrolled: 10, target: 9 },
  { date: "2026-08-25", enrolled: 12, target: 12 },
  { date: "2026-09-01", enrolled: 14, target: 15 },
]