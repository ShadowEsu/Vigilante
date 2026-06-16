import SwiftUI

struct AuthView: View {
    @EnvironmentObject var store: VigilStore
    @State private var email = ""
    @State private var sent = false
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        VStack(spacing: 24) {
            Text("Vigil")
                .font(.system(size: 32, weight: .semibold, design: .rounded))
                .foregroundStyle(VigilTheme.accent)

            Text("Sign in with a magic link")
                .foregroundStyle(VigilTheme.muted)

            if sent {
                VigilPanel(title: "Link sent") {
                    Text("Check \(email) for your sign-in link.")
                        .foregroundStyle(VigilTheme.muted)
                        .frame(maxWidth: .infinity)
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("EMAIL")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(VigilTheme.muted)
                    TextField("you@company.com", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding(12)
                        .background(VigilTheme.surface)
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(VigilTheme.border))
                }

                if let error {
                    Text(error).foregroundStyle(VigilTheme.alert).font(.caption)
                }

                Button {
                    Task {
                        loading = true
                        error = nil
                        do {
                            try await store.sendMagicLink(email: email.trimmingCharacters(in: .whitespaces))
                            sent = true
                        } catch {
                            self.error = error.localizedDescription
                        }
                        loading = false
                    }
                } label: {
                    Text(loading ? "Sending…" : "Send magic link")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(VigilTheme.accent)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .disabled(loading || email.isEmpty)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(VigilTheme.bg)
    }
}

struct DashboardView: View {
    @EnvironmentObject var store: VigilStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Dashboard")
                            .font(.system(size: 24, weight: .semibold, design: .rounded))
                        Text("\(store.analyses.count) analyses")
                            .foregroundStyle(VigilTheme.muted)
                            .font(.caption)
                    }
                    Spacer()
                    NavigationLink("New") {
                        NewAnalysisView()
                    }
                    .foregroundStyle(VigilTheme.accent)

                    Button("Sign out") {
                        Task { await store.signOut() }
                    }
                    .foregroundStyle(VigilTheme.muted)
                    .font(.caption)
                }

                if store.loading {
                    ProgressView().tint(VigilTheme.accent)
                }

                if let error = store.errorMessage {
                    Text(error).foregroundStyle(VigilTheme.alert).font(.caption)
                }

                if let runMessage = store.runMessage {
                    Text(runMessage)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(VigilTheme.live)
                }

                VigilPanel(title: "Analyses") {
                    if store.analyses.isEmpty {
                        Text("No analyses yet.").foregroundStyle(VigilTheme.muted)
                    } else {
                        ForEach(store.analyses) { analysis in
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(analysis.name).font(.body.weight(.medium))
                                        Text("\(analysis.targetType) · \(analysis.target)")
                                            .font(.system(.caption2, design: .monospaced))
                                            .foregroundStyle(VigilTheme.muted)
                                    }
                                    Spacer()
                                    Button("Run now") {
                                        Task { await store.runAnalysis(id: analysis.id) }
                                    }
                                    .font(.system(.caption2, design: .monospaced))
                                    .foregroundStyle(VigilTheme.accent)
                                }
                                SpendMeterView(spend: analysis.spendUsd, budget: analysis.budgetCapUsd)
                            }
                            .padding(.vertical, 8)
                            Divider().overlay(VigilTheme.border)
                        }
                    }
                }

                VigilPanel(title: "Latest brief") {
                    if let brief = store.latestBrief {
                        Text(brief.title).font(.headline)
                        Text(brief.body).foregroundStyle(VigilTheme.muted)
                    } else {
                        Text("No briefs yet.").foregroundStyle(VigilTheme.muted)
                    }
                }

                VigilPanel(title: "Signals feed") {
                    if store.signals.isEmpty {
                        Text("No signals yet.").foregroundStyle(VigilTheme.muted)
                    } else {
                        ForEach(store.signals.prefix(20)) { signal in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(signal.title).font(.body.weight(.medium))
                                Text(signal.detail).foregroundStyle(VigilTheme.muted).font(.caption)
                                Text("\(signal.type) · \(signal.severity)")
                                    .font(.system(.caption2, design: .monospaced))
                                    .foregroundStyle(VigilTheme.accent)
                            }
                            .padding(.vertical, 6)
                            Divider().overlay(VigilTheme.border)
                        }
                    }
                }
            }
            .padding(16)
        }
        .background(VigilTheme.bg)
        .refreshable { await store.refreshDashboard() }
    }
}

struct NewAnalysisView: View {
    @EnvironmentObject var store: VigilStore
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var target = ""
    @State private var sourceURL = ""
    @State private var budget = "10"
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("New analysis")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))

                formField("Name", text: $name)
                formField("Target", text: $target)
                formField("Source URL", text: $sourceURL)
                formField("Budget cap (USD)", text: $budget)

                if let error {
                    Text(error).foregroundStyle(VigilTheme.alert).font(.caption)
                }

                Button {
                    Task {
                        loading = true
                        error = nil
                        do {
                            try await store.createAnalysis(
                                name: name,
                                targetType: "company",
                                target: target,
                                sourceURL: sourceURL,
                                budget: Double(budget) ?? 10
                            )
                            dismiss()
                        } catch {
                            self.error = error.localizedDescription
                        }
                        loading = false
                    }
                } label: {
                    Text(loading ? "Creating…" : "Create analysis")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(VigilTheme.accent)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .disabled(loading || name.isEmpty || target.isEmpty || sourceURL.isEmpty)
            }
            .padding(16)
        }
        .background(VigilTheme.bg)
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder
    private func formField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(VigilTheme.muted)
            TextField("", text: text)
                .padding(12)
                .background(VigilTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(VigilTheme.border))
        }
    }
}
