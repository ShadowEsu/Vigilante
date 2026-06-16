package com.vigil.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

@Serializable
data class Analysis(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("target_type") val targetType: String,
    val target: String,
    val sources: JsonElement,
    @SerialName("cadence_minutes") val cadenceMinutes: Int,
    val model: String,
    @SerialName("budget_cap_usd") val budgetCapUsd: Double,
    @SerialName("spend_usd") val spendUsd: Double,
    val status: String,
    @SerialName("last_run_at") val lastRunAt: String? = null,
    @SerialName("next_run_at") val nextRunAt: String? = null,
    @SerialName("created_at") val createdAt: String,
) {
    fun sourceUrls(): List<String> = when (sources) {
        is JsonArray -> sources.map { it.jsonPrimitive.content }
        else -> emptyList()
    }
}

@Serializable
data class Signal(
    val id: String,
    @SerialName("analysis_id") val analysisId: String,
    val type: String,
    val title: String,
    val detail: String,
    val severity: String,
    @SerialName("source_url") val sourceUrl: String,
    @SerialName("created_at") val createdAt: String,
)

@Serializable
data class Brief(
    val id: String,
    @SerialName("analysis_id") val analysisId: String,
    val title: String,
    val body: String,
    @SerialName("created_at") val createdAt: String,
)

@Serializable
data class RunAnalysisResult(
    val ok: Boolean,
    val skipped: Boolean? = null,
    val reason: String? = null,
    @SerialName("signalsCreated") val signalsCreated: Int? = null,
    @SerialName("briefCreated") val briefCreated: Boolean? = null,
    @SerialName("baselineCreated") val baselineCreated: Boolean? = null,
    val error: String? = null,
)

@Serializable
data class NewAnalysisInput(
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("target_type") val targetType: String,
    val target: String,
    val sources: List<String>,
    @SerialName("cadence_minutes") val cadenceMinutes: Int,
    val model: String,
    @SerialName("budget_cap_usd") val budgetCapUsd: Double,
    val status: String = "live",
    @SerialName("next_run_at") val nextRunAt: String,
)
