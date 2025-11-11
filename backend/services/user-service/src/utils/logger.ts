/**
 * Secure Logger for HIPAA Compliance
 * Never logs PHI (Protected Health Information) or sensitive data
 */

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  metadata?: Record<string, any>;
}

class SecureLogger {
  private serviceName: string;

  constructor(serviceName: string = 'user-service') {
    this.serviceName = serviceName;
  }

  /**
   * Sanitize data to remove PHI and sensitive information
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'password_hash',
      'token',
      'accessToken',
      'refreshToken',
      'jwt',
      'apiKey',
      'secret',
      'ssn',
      'socialSecurityNumber',
      'creditCard',
      'cvv',
      'pin',
      'otp',
      'mfaSecret',
      'twoFactorSecret',
    ];

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Check if field contains sensitive information
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize database connection strings
   */
  private sanitizeConnectionString(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '***';
      }
      if (parsed.username && parsed.username !== 'virtualdoc') {
        parsed.username = '***';
      }
      return parsed.toString();
    } catch {
      // If URL parsing fails, mask the entire string
      return url.replace(/:[^:@]+@/, ':***@');
    }
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
    };

    if (metadata) {
      entry.metadata = this.sanitize(metadata);
    }

    return entry;
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const metadataStr = entry.metadata
      ? ` ${JSON.stringify(entry.metadata)}`
      : '';
    return `[${entry.timestamp}] ${entry.level} [${entry.service}] ${entry.message}${metadataStr}`;
  }

  /**
   * Log error (production-safe)
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const errorMetadata: Record<string, any> = {
      ...metadata,
    };

    if (error) {
      errorMetadata.errorName = error.name;
      errorMetadata.errorMessage = error.message;
      
      // Only include stack trace in development
      if (process.env.NODE_ENV === 'development') {
        errorMetadata.stack = error.stack;
      }
    }

    const entry = this.createLogEntry(LogLevel.ERROR, message, errorMetadata);
    
    // In production, log to secure storage (implement file-based or external logging)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement secure logging service (e.g., Winston with secure transport)
      // For now, sanitize and log to console
      console.error(this.formatLog(entry));
    } else {
      console.error(this.formatLog(entry));
    }
  }

  /**
   * Log warning
   */
  warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
    console.warn(this.formatLog(entry));
  }

  /**
   * Log info (safe for production)
   */
  info(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    
    // Only log info in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_INFO_LOGS === 'true') {
      console.log(this.formatLog(entry));
    }
  }

  /**
   * Log debug (development only)
   */
  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
      console.debug(this.formatLog(entry));
    }
  }

  /**
   * Log database connection info (sanitized)
   */
  logDatabaseConfig(config: { host?: string; port?: number; database?: string; connectionString?: string }): void {
    if (process.env.NODE_ENV === 'development') {
      const sanitized = {
        host: config.host,
        port: config.port,
        database: config.database,
        connectionString: config.connectionString
          ? this.sanitizeConnectionString(config.connectionString)
          : undefined,
      };
      this.debug('Database configuration', sanitized);
    }
  }

  /**
   * Log query execution (sanitized, no PHI)
   */
  logQuery(query: string, duration: number, rowCount?: number): void {
    if (process.env.NODE_ENV === 'development') {
      // Remove potential PHI from query text
      const sanitizedQuery = query.replace(/'([^']+)'/g, (match, content) => {
        // Mask email-like patterns
        if (content.includes('@')) {
          return "'***REDACTED***'";
        }
        // Mask long strings that might be PHI
        if (content.length > 20) {
          return "'***REDACTED***'";
        }
        return match;
      });

      this.debug('Query executed', {
        query: sanitizedQuery,
        duration: `${duration}ms`,
        rows: rowCount,
      });
    }
  }

  /**
   * Log security event (for audit trail)
   */
  security(event: string, metadata?: Record<string, any>): void {
    const auditMetadata = {
      ...metadata,
      eventType: 'SECURITY',
    };
    
    const entry = this.createLogEntry(LogLevel.INFO, `[SECURITY] ${event}`, auditMetadata);
    
    // Security events should always be logged
    console.log(this.formatLog(entry));
    
    // TODO: Send to secure audit log storage
  }
}

// Export singleton instance
export const logger = new SecureLogger('user-service');
export default logger;

