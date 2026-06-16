import Foundation

enum VigilConfig {
    static var supabaseURL: URL {
        guard let url = URL(string: value(for: "SUPABASE_URL")) else {
            fatalError("Set SUPABASE_URL in Config.xcconfig")
        }
        return url
    }

    static var supabaseAnonKey: String {
        value(for: "SUPABASE_ANON_KEY")
    }

    static var apiBaseURL: URL {
        guard let url = URL(string: value(for: "API_BASE_URL")) else {
            fatalError("Set API_BASE_URL in Config.xcconfig")
        }
        return url
    }

    static let redirectURL = URL(string: "vigil://auth/callback")!

    private static func value(for key: String) -> String {
        Bundle.main.object(forInfoDictionaryKey: key) as? String ?? ""
    }
}
