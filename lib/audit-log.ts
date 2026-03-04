/**
 * Audit Logging System
 * 
 * COMPLIANCE: Required for NDPR/NDPA and financial regulations
 * Maintains immutable record of all sensitive operations
 * 
 * SECURITY: Logs should never contain:
 * - Full NIN numbers (always masked)
 * - Passwords or API keys
 * - Full card numbers
 * - Sensitive PII beyond what's necessary
 */

export type AuditEventType =
  | "user.registered"
  | "user.login"
  | "user.logout"
  | "wallet.funded"
  | "wallet.debited"
  | "wallet.refunded"
  | "nin.verification.initiated"
  | "nin.verification.success"
  | "nin.verification.failed"
  | "payment.initialized"
  | "payment.success"
  | "payment.failed"
  | "webhook.received"
  | "webhook.processed"
  | "webhook.failed"
  | "api.error"
  | "security.suspicious_activity";

export interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  status: "success" | "failure" | "pending";
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

/**
 * Log audit event
 * 
 * In production, this should write to:
 * 1. Database table for queryable audit trail
 * 2. External logging service (e.g., CloudWatch, Datadog)
 * 3. SIEM system for security monitoring
 */
export function logAuditEvent(entry: AuditLogEntry): void {
  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  };

  // Console logging (development)
  console.log("[AUDIT]", JSON.stringify(logEntry));

  // TODO: Production implementation
  // 1. Write to audit_logs database table
  // 2. Send to external logging service
  // 3. Alert on critical events (security.suspicious_activity)
  
  // Example production implementation:
  /*
  if (process.env.NODE_ENV === "production") {
    // Write to database
    db.insert(auditLogs).values(logEntry).catch(console.error);
    
    // Send to external service
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(`Audit: ${entry.eventType}`, {
        level: entry.status === "failure" ? "error" : "info",
        extra: logEntry
      });
    }
    
    // Alert on suspicious activity
    if (entry.eventType === "security.suspicious_activity") {
      sendSecurityAlert(logEntry);
    }
  }
  */
}

/**
 * Log payment event with financial audit requirements
 */
export function logPaymentEvent(
  eventType: Extract<AuditEventType, "payment.initialized" | "payment.success" | "payment.failed">,
  userId: string,
  amount: number,
  reference: string,
  status: "success" | "failure" | "pending",
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    eventType,
    userId,
    resource: "payment",
    action: eventType.split(".")[1],
    status,
    metadata: {
      amount,
      reference,
      currency: "NGN",
      ...metadata
    }
  });
}

/**
 * Log NIN verification with data protection compliance
 */
export function logNINVerification(
  eventType: Extract<
    AuditEventType,
    "nin.verification.initiated" | "nin.verification.success" | "nin.verification.failed"
  >,
  userId: string,
  ninMasked: string,
  status: "success" | "failure" | "pending",
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    eventType,
    userId,
    resource: "nin_verification",
    action: eventType.split(".")[2],
    status,
    metadata: {
      ninMasked, // Only log masked NIN
      ...metadata
    }
  });
}

/**
 * Log security event for monitoring
 */
export function logSecurityEvent(
  description: string,
  userId?: string,
  ipAddress?: string,
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    eventType: "security.suspicious_activity",
    userId,
    ipAddress,
    resource: "security",
    action: "suspicious_activity_detected",
    status: "failure",
    metadata: {
      description,
      ...metadata
    }
  });
}

/**
 * Log API error for debugging and monitoring
 */
export function logAPIError(
  endpoint: string,
  error: unknown,
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    eventType: "api.error",
    userId,
    resource: endpoint,
    action: "api_call",
    status: "failure",
    errorMessage: error instanceof Error ? error.message : String(error),
    metadata: {
      errorStack: error instanceof Error ? error.stack : undefined,
      ...metadata
    }
  });
}
