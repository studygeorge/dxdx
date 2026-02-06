import { CreateInvestmentController } from './create.controller'
import { ReadInvestmentsController } from './read.controller'
import { UpdateInvestmentsController } from './update.controller'
import { WithdrawalController } from './withdrawal.controller'
import { SimulationController } from './simulation.controller'

export class InvestmentsController {
  // Create operations
  static createInvestment = CreateInvestmentController.createInvestment

  // Read operations
  static getMyInvestments = ReadInvestmentsController.getMyInvestments
  static getInvestment = ReadInvestmentsController.getInvestment

  // Update operations
  static confirmPayment = UpdateInvestmentsController.confirmPayment
  static upgradeInvestment = UpdateInvestmentsController.upgradeInvestment
  static cancelInvestment = UpdateInvestmentsController.cancelInvestment

  // Withdrawal operations
  static earlyWithdrawInvestment = WithdrawalController.earlyWithdrawInvestment
  static partialWithdrawInvestment = WithdrawalController.partialWithdrawInvestment
  static requestWithdrawal = WithdrawalController.requestWithdrawal

  // Simulation operations
  static simulateDate = SimulationController.simulateDate
}