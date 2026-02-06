import { PACKAGES, PackageConfig } from '../types/referral.types'

export class CommissionService {
  static calculateTierPercent(level1Count: number): number {
    if (level1Count >= 10) return 0.07
    if (level1Count >= 6) return 0.06
    if (level1Count >= 4) return 0.05
    if (level1Count >= 2) return 0.04
    return 0.03
  }

  static calculateCommission(amount: number, percentage: number): number {
    return Number(amount) * percentage
  }

  static determineNewPackage(totalAmount: number): { package: string; roi: number } {
    if (totalAmount >= 6000) {
      return { package: PACKAGES.elite.name, roi: PACKAGES.elite.monthlyRate }
    } else if (totalAmount >= 3000) {
      return { package: PACKAGES.pro.name, roi: PACKAGES.pro.monthlyRate }
    } else if (totalAmount >= 1000) {
      return { package: PACKAGES.advanced.name, roi: PACKAGES.advanced.monthlyRate }
    } else {
      return { package: PACKAGES.starter.name, roi: PACKAGES.starter.monthlyRate }
    }
  }

  static isUpgraded(oldPackage: string, newPackage: string): boolean {
    return oldPackage !== newPackage
  }
}
