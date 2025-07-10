import { EventEmitter } from 'events';
import { ProgressEvent, ProgressEventType } from '../contracts/index.js';

export class ProgressTracker extends EventEmitter {
  private sessions: Map<string, ProgressEvent[]> = new Map();
  
  constructor() {
    super();
  }
  
  startTool(toolName: string, sessionId: string, message?: string): void {
    const event: ProgressEvent = {
      type: ProgressEventType.STARTED,
      toolName,
      sessionId,
      message: message || `Starting ${toolName}...`,
      progress: 0
    };
    
    this.addEvent(sessionId, event);
    this.emit('progress', event);
  }
  
  updateProgress(toolName: string, sessionId: string, progress: number, message?: string): void {
    const event: ProgressEvent = {
      type: ProgressEventType.PROGRESS,
      toolName,
      sessionId,
      progress,
      message
    };
    
    this.addEvent(sessionId, event);
    this.emit('progress', event);
  }
  
  completeTool(toolName: string, sessionId: string, data?: any): void {
    const event: ProgressEvent = {
      type: ProgressEventType.COMPLETED,
      toolName,
      sessionId,
      progress: 100,
      message: `${toolName} completed successfully`,
      data
    };
    
    this.addEvent(sessionId, event);
    this.emit('progress', event);
  }
  
  errorTool(toolName: string, sessionId: string, error: string): void {
    const event: ProgressEvent = {
      type: ProgressEventType.ERROR,
      toolName,
      sessionId,
      error,
      message: `${toolName} failed: ${error}`
    };
    
    this.addEvent(sessionId, event);
    this.emit('progress', event);
  }
  
  private addEvent(sessionId: string, event: ProgressEvent): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    this.sessions.get(sessionId)!.push(event);
    
    // Clean up old sessions (keep last 100)
    if (this.sessions.size > 100) {
      const oldestSession = this.sessions.keys().next().value;
      if (oldestSession) {
        this.sessions.delete(oldestSession);
      }
    }
  }
  
  getSessionEvents(sessionId: string): ProgressEvent[] {
    return this.sessions.get(sessionId) || [];
  }
}

// Global instance
export const progressTracker = new ProgressTracker();