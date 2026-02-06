export class ValidationUtils {
  static validateTRC20Address(address: string): boolean {
    return address.startsWith('T') && address.length === 34
  }

  static validateTRC20AddressWithError(address: string): void {
    if (!this.validateTRC20Address(address)) {
      throw new Error('Invalid TRC-20 address format')
    }
  }

  static calculateDaysPassed(startDate: Date, endDate: Date = new Date()): number {
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  static isWithdrawalAvailable(investmentDate: Date, requiredDays: number): boolean {
    const daysPassed = this.calculateDaysPassed(investmentDate)
    return daysPassed >= requiredDays
  }

  static getDaysRemaining(investmentDate: Date, requiredDays: number): number {
    const daysPassed = this.calculateDaysPassed(investmentDate)
    return Math.max(0, requiredDays - daysPassed)
  }
}
