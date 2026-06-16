import Foundation
import Supabase

@MainActor
final class VigilStore: ObservableObject {
    @Published var isAuthenticated = false
    @Published var analyses: [Analysis] = []
    @Published var signals: [Signal] = []
    @Published var latestBrief: Brief?
    @Published var loading = false
    @Published var errorMessage: String?
    @Published var runMessage: String?

    let client: SupabaseClient

    init() {
        client = SupabaseClient(
            supabaseURL: VigilConfig.supabaseURL,
            supabaseKey: VigilConfig.supabaseAnonKey
        )
    }

    func bootstrap() async {
        isAuthenticated = client.auth.currentSession != nil
        if isAuthenticated {
            await refreshDashboard()
        }
    }

    func sendMagicLink(email: String) async throws {
        try await client.auth.signInWithOTP(
            email: email,
            redirectTo: VigilConfig.redirectURL
        )
    }

    func handleOpenURL(_ url: URL) async {
        do {
            try await client.auth.session(from: url)
            isAuthenticated = true
            await refreshDashboard()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() async {
        try? await client.auth.signOut()
        isAuthenticated = false
        analyses = []
        signals = []
        latestBrief = nil
    }

    func refreshDashboard() async {
        loading = true
        errorMessage = nil
        defer { loading = false }

        do {
            guard let userId = client.auth.currentUser?.id.uuidString else {
                isAuthenticated = false
                return
            }

            analyses = try await client
                .from("analyses")
                .select()
                .eq("user_id", value: userId)
                .order("created_at", ascending: false)
                .execute()
                .value

            let ids = analyses.map(\.id)
            guard !ids.isEmpty else {
                signals = []
                latestBrief = nil
                return
            }

            signals = try await client
                .from("signals")
                .select()
                .in("analysis_id", values: ids)
                .order("created_at", ascending: false)
                .limit(50)
                .execute()
                .value

            let briefs: [Brief] = try await client
                .from("briefs")
                .select()
                .in("analysis_id", values: ids)
                .order("created_at", ascending: false)
                .limit(1)
                .execute()
                .value

            latestBrief = briefs.first
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createAnalysis(
        name: String,
        targetType: String,
        target: String,
        sourceURL: String,
        budget: Double
    ) async throws {
        guard let userId = client.auth.currentUser?.id.uuidString else {
            throw VigilError.notAuthenticated
        }

        let input = NewAnalysisInput(
            userId: userId,
            name: name,
            targetType: targetType,
            target: target,
            sources: [sourceURL],
            cadenceMinutes: 1440,
            model: "claude-sonnet",
            budgetCapUsd: budget,
            status: "live",
            nextRunAt: ISO8601DateFormatter().string(from: Date())
        )

        try await client.from("analyses").insert(input).execute()
        await refreshDashboard()
    }

    func runAnalysis(id: String) async {
        runMessage = "Running…"
        do {
            let result = try await VigilAPI.runAnalysis(
                analysisId: id,
                accessToken: client.auth.currentSession?.accessToken ?? ""
            )

            if let error = result.error {
                runMessage = error
            } else if result.skipped == true {
                runMessage = result.reason ?? "Skipped"
            } else if result.baselineCreated == true && result.briefCreated != true {
                runMessage = "Baseline saved · run again after page changes"
            } else {
                var parts = ["Done"]
                if let count = result.signalsCreated { parts.append("\(count) signal(s)") }
                if result.briefCreated == true { parts.append("brief created") }
                runMessage = parts.joined(separator: " · ")
            }

            await refreshDashboard()
        } catch {
            runMessage = error.localizedDescription
        }
    }
}

enum VigilError: LocalizedError {
    case notAuthenticated

    var errorDescription: String? {
        switch self {
        case .notAuthenticated: return "Not authenticated"
        }
    }
}
