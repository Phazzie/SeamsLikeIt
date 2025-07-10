import { CostConfig, CostTracker } from '../contracts/index.js';

export class SDDCostTracker implements CostTracker {
  private dailySpend: Map<string, number> = new Map();
  private config: CostConfig;
  
  constructor(config?: Partial<CostConfig>) {
    this.config = {
      maxDailySpend: parseFloat(process.env.MAX_DAILY_SPEND || '10'),
      maxRequestCost: parseFloat(process.env.MAX_REQUEST_COST || '0.50'),
      warningThreshold: 0.8,
      alertEmail: process.env.ALERT_EMAIL,
      ...config
    };
  }
  
  async getCurrentSpend(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    return this.dailySpend.get(today) || 0;
  }
  
  async recordUsage(_toolName: string, cost: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const currentSpend = this.dailySpend.get(today) || 0;
    const newSpend = currentSpend + cost;
    
    this.dailySpend.set(today, newSpend);
    
    // Check if we've hit warning threshold
    if (newSpend >= this.config.maxDailySpend * this.config.warningThreshold) {
      console.warn(`⚠️ Cost warning: Daily spend at ${newSpend.toFixed(4)} (${(newSpend/this.config.maxDailySpend*100).toFixed(1)}% of limit)`);
      
      // In production, send alert email
      if (this.config.alertEmail) {
        // TODO: Implement email alerting
      }
    }
    
    // Clean up old entries (keep last 30 days)
    if (this.dailySpend.size > 30) {
      const oldestDate = Array.from(this.dailySpend.keys()).sort()[0];
      this.dailySpend.delete(oldestDate);
    }
  }
  
  async checkBudget(estimatedCost: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const currentSpend = this.dailySpend.get(today) || 0;
    
    // Check daily limit
    if (currentSpend + estimatedCost > this.config.maxDailySpend) {
      return false;
    }
    
    // Check per-request limit
    if (estimatedCost > this.config.maxRequestCost) {
      return false;
    }
    
    return true;
  }
  
  getStats(): { daily: number; monthly: number; requests: number } {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    
    const daily = this.dailySpend.get(today) || 0;
    
    const monthly = Array.from(this.dailySpend.entries())
      .filter(([date]) => date.startsWith(thisMonth))
      .reduce((sum, [_, cost]) => sum + cost, 0);
    
    const requests = Array.from(this.dailySpend.values())
      .reduce((sum, cost) => sum + Math.ceil(cost / 0.0006), 0); // Estimate based on avg cost
    
    return { daily, monthly, requests };
  }
}

// Global instance
export const costTracker = new SDDCostTracker();