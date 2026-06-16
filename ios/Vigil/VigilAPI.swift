import Foundation

enum VigilAPI {
    static func runAnalysis(analysisId: String, accessToken: String) async throws -> RunAnalysisResult {
        var request = URLRequest(
            url: VigilConfig.apiBaseURL
                .appendingPathComponent("api/analyses/\(analysisId)/run")
        )
        request.httpMethod = "POST"
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        if http.statusCode >= 400 {
            if let err = try? JSONDecoder().decode(RunAnalysisResult.self, from: data), let message = err.error {
                throw NSError(domain: "Vigil", code: http.statusCode, userInfo: [NSLocalizedDescriptionKey: message])
            }
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(RunAnalysisResult.self, from: data)
    }
}
