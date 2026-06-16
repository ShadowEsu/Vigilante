import Foundation

struct Analysis: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let targetType: String
    let target: String
    let sources: [String]
    let cadenceMinutes: Int
    let model: String
    let budgetCapUsd: Double
    let spendUsd: Double
    let status: String
    let lastRunAt: String?
    let nextRunAt: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, target, model, status, sources
        case userId = "user_id"
        case targetType = "target_type"
        case cadenceMinutes = "cadence_minutes"
        case budgetCapUsd = "budget_cap_usd"
        case spendUsd = "spend_usd"
        case lastRunAt = "last_run_at"
        case nextRunAt = "next_run_at"
        case createdAt = "created_at"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        userId = try c.decode(String.self, forKey: .userId)
        name = try c.decode(String.self, forKey: .name)
        targetType = try c.decode(String.self, forKey: .targetType)
        target = try c.decode(String.self, forKey: .target)
        cadenceMinutes = try c.decode(Int.self, forKey: .cadenceMinutes)
        model = try c.decode(String.self, forKey: .model)
        budgetCapUsd = try c.decode(Double.self, forKey: .budgetCapUsd)
        spendUsd = try c.decode(Double.self, forKey: .spendUsd)
        status = try c.decode(String.self, forKey: .status)
        lastRunAt = try c.decodeIfPresent(String.self, forKey: .lastRunAt)
        nextRunAt = try c.decodeIfPresent(String.self, forKey: .nextRunAt)
        createdAt = try c.decode(String.self, forKey: .createdAt)

        if let arr = try? c.decode([String].self, forKey: .sources) {
            sources = arr
        } else {
            sources = []
        }
    }
}

struct Signal: Codable, Identifiable {
    let id: String
    let analysisId: String
    let type: String
    let title: String
    let detail: String
    let severity: String
    let sourceUrl: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, type, title, detail, severity
        case analysisId = "analysis_id"
        case sourceUrl = "source_url"
        case createdAt = "created_at"
    }
}

struct Brief: Codable, Identifiable {
    let id: String
    let analysisId: String
    let title: String
    let body: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, title, body
        case analysisId = "analysis_id"
        case createdAt = "created_at"
    }
}

struct RunAnalysisResult: Codable {
    let ok: Bool
    let skipped: Bool?
    let reason: String?
    let signalsCreated: Int?
    let briefCreated: Bool?
    let baselineCreated: Bool?
    let error: String?
}

struct NewAnalysisInput: Encodable {
    let userId: String
    let name: String
    let targetType: String
    let target: String
    let sources: [String]
    let cadenceMinutes: Int
    let model: String
    let budgetCapUsd: Double
    let status: String
    let nextRunAt: String

    enum CodingKeys: String, CodingKey {
        case name, target, model, status, sources
        case userId = "user_id"
        case targetType = "target_type"
        case cadenceMinutes = "cadence_minutes"
        case budgetCapUsd = "budget_cap_usd"
        case nextRunAt = "next_run_at"
    }
}
