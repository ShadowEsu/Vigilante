package com.vigil.app.data

import android.content.Context
import com.vigil.app.BuildConfig
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.serializer.KotlinXSerializer
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import java.time.Instant

class VigilRepository private constructor(context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    val supabase = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_ANON_KEY,
    ) {
        defaultSerializer = KotlinXSerializer(json)
        install(Auth)
        install(Postgrest)
    }

    private val http = HttpClient(Android) {
        install(ContentNegotiation) {
            json(json)
        }
    }

    val auth get() = supabase.auth

    suspend fun currentUserId(): String? =
        auth.currentSessionOrNull()?.user?.id

    suspend fun accessToken(): String? =
        auth.currentSessionOrNull()?.accessToken

    suspend fun signInWithMagicLink(email: String) {
        auth.signInWith(io.github.jan.supabase.auth.providers.builtin.OTP) {
            this.email = email
            redirectUrl = REDIRECT_URL
        }
    }

    suspend fun signOut() {
        auth.signOut()
    }

    suspend fun fetchAnalyses(userId: String): List<Analysis> =
        supabase.postgrest.from("analyses")
            .select {
                filter { eq("user_id", userId) }
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
            }
            .decodeList()

    suspend fun fetchSignals(analysisIds: List<String>): List<Signal> {
        if (analysisIds.isEmpty()) return emptyList()
        return supabase.postgrest.from("signals")
            .select {
                filter { isIn("analysis_id", analysisIds) }
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(50)
            }
            .decodeList()
    }

    suspend fun fetchLatestBrief(analysisIds: List<String>): Brief? {
        if (analysisIds.isEmpty()) return null
        return supabase.postgrest.from("briefs")
            .select {
                filter { isIn("analysis_id", analysisIds) }
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(1)
            }
            .decodeList<Brief>()
            .firstOrNull()
    }

    suspend fun createAnalysis(input: NewAnalysisInput) {
        supabase.postgrest.from("analyses").insert(input)
    }

    suspend fun runAnalysis(analysisId: String): RunAnalysisResult {
        val token = accessToken()
            ?: return RunAnalysisResult(ok = false, error = "Not authenticated")

        val url = "${BuildConfig.API_BASE_URL.trimEnd('/')}/api/analyses/$analysisId/run"
        return http.post(url) {
            header("Authorization", "Bearer $token")
        }.body()
    }

    companion object {
        const val REDIRECT_URL = "vigil://auth/callback"

        @Volatile
        private var instance: VigilRepository? = null

        fun get(context: Context): VigilRepository =
            instance ?: synchronized(this) {
                instance ?: VigilRepository(context.applicationContext).also { instance = it }
            }
    }
}

fun nowIso(): String = Instant.now().toString()
