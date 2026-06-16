import SwiftUI

enum VigilTheme {
    static let bg = Color(red: 10/255, green: 11/255, blue: 14/255)
    static let surface = Color(red: 18/255, green: 20/255, blue: 26/255)
    static let accent = Color(red: 110/255, green: 123/255, blue: 255/255)
    static let live = Color(red: 62/255, green: 207/255, blue: 142/255)
    static let alert = Color(red: 232/255, green: 161/255, blue: 58/255)
    static let muted = Color.white.opacity(0.45)
    static let border = Color.white.opacity(0.08)
}

struct VigilPanel<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title.uppercased())
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(VigilTheme.muted)
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(VigilTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(VigilTheme.border))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct SpendMeterView: View {
    let spend: Double
    let budget: Double

    var body: some View {
        let pct = budget > 0 ? min(spend / budget, 1) : 0
        let over = spend >= budget

        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Spend / budget")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(VigilTheme.muted)
                Spacer()
                Text(String(format: "$%.4f / $%.2f", spend, budget))
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(over ? VigilTheme.alert : VigilTheme.muted)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(VigilTheme.border)
                    Capsule()
                        .fill(over ? VigilTheme.alert : VigilTheme.accent)
                        .frame(width: geo.size.width * pct)
                }
            }
            .frame(height: 4)
        }
    }
}
