// src/services/AuditService.ts

/**
 * AuditService: Implements the Compliance & Audit Trail feature.
 * Records every significant user interaction and system state change for immutability and compliance.
 * In a production environment, this would push to an immutable log (e.g., blockchain or specialized database table).
 */
class AuditService {
    /**
     * Records a user action.
     * @param {string} userId - The ID of the user performing the action.
     * @param {string} actionType - The type of action (e.g., 'CHAT_MESSAGE_SENT', 'DOCUMENT_VIEWED', 'CONFIG_UPDATED').
     * @param {Object} details - Specific metadata about the action (e.g., prompt, response status, duration).
     * @returns {Promise<string>} The unique ID of the audit record.
     */
    async record(userId, actionType, details) {
        const record = {
            timestamp: new Date().toISOString(),
            userId: userId,
            actionType: actionType,
            details: details,
            recordId: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        // In production, this would use Supabase/dedicated logging service (e.g., ELK Stack)
        console.log(`[AUDIT] Recording: ${record.recordId} | User: ${userId} | Type: ${actionType}`);
        await Supabase.logAudit(record); // Conceptual call to Supabase logging function
        return record.recordId;
    }

    /**
     * Records an AI inference event for compliance.
     * @param {string} userId - The user ID.
     * @param {string} prompt - The full user prompt.
     * @param {string} modelUsed - The specific LLM model identifier.
     * @param {string} finalResponse - The sanitized, final response delivered to the user.
     * @returns {Promise<string>} The unique audit record ID.
     */
    async recordInference(userId, prompt, modelUsed, finalResponse) {
        return this.record(userId, 'AI_INFERENCE', {
            prompt: prompt,
            modelUsed: modelUsed,
            response: finalResponse
        });
    }
}

export const auditService = new AuditService();