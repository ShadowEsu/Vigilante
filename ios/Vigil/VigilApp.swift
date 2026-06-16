import SwiftUI

@main
struct VigilApp: App {
    @StateObject private var store = VigilStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    Task { await store.handleOpenURL(url) }
                }
                .task { await store.bootstrap() }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var store: VigilStore

    var body: some View {
        NavigationStack {
            Group {
                if store.isAuthenticated {
                    DashboardView()
                } else {
                    AuthView()
                }
            }
        }
        .tint(VigilTheme.accent)
    }
}
