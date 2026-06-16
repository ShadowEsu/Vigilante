package com.vigil.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vigil.app.ui.*
import com.vigil.app.ui.theme.*
import com.vigil.app.ui.AuthViewModel
import com.vigil.app.ui.DashboardViewModel
import com.vigil.app.ui.NewAnalysisViewModel

@Composable
fun AuthScreen(
    onSignedIn: () -> Unit,
    viewModel: AuthViewModel = viewModel(),
) {
    val email by viewModel.email.collectAsState()
    val sent by viewModel.sent.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val isSignedIn by viewModel.isSignedIn.collectAsState()

    LaunchedEffect(isSignedIn) {
        if (isSignedIn) onSignedIn()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Bg)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Vigil", style = MaterialTheme.typography.headlineMedium, color = Accent)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Sign in with a magic link", color = Muted, style = MaterialTheme.typography.bodyMedium)

        Spacer(modifier = Modifier.height(32.dp))

        if (sent) {
            VigilPanel(title = "Link sent") {
                Text(
                    "Check $email for your sign-in link.",
                    color = Muted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        } else {
            VigilTextField(
                value = email,
                onValueChange = viewModel::setEmail,
                label = "Email",
            )
            Spacer(modifier = Modifier.height(16.dp))
            error?.let {
                Text(it, color = Alert, style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(8.dp))
            }
            VigilPrimaryButton(
                text = if (loading) "Sending…" else "Send magic link",
                onClick = viewModel::sendMagicLink,
                enabled = !loading && email.isNotBlank(),
            )
        }
    }
}

@Composable
fun DashboardScreen(
    onNewAnalysis: () -> Unit,
    onSignOut: () -> Unit,
    viewModel: DashboardViewModel = viewModel(),
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(Unit) { viewModel.refresh() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Bg)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("Dashboard", style = MaterialTheme.typography.headlineMedium)
                Text(
                    "${state.analyses.size} analyses",
                    color = Muted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TextButton(onClick = onNewAnalysis) { Text("New", color = Accent) }
                TextButton(onClick = onSignOut) { Text("Sign out", color = Muted) }
            }
        }

        state.error?.let { Text(it, color = Alert) }
        state.runMessage?.let { Text(it, color = Live, style = MaterialTheme.typography.labelSmall) }

        if (state.loading) {
            CircularProgressIndicator(color = Accent, modifier = Modifier.align(Alignment.CenterHorizontally))
        }

        VigilPanel(title = "Analyses") {
            if (state.analyses.isEmpty()) {
                Text("No analyses yet.", color = Muted)
            } else {
                state.analyses.forEach { analysis ->
                    Column(modifier = Modifier.padding(vertical = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(analysis.name, style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    "${analysis.targetType} · ${analysis.target}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Muted,
                                )
                            }
                            TextButton(onClick = { viewModel.runAnalysis(analysis.id) }) {
                                Text("Run now", color = Accent, style = MaterialTheme.typography.labelSmall)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        SpendMeter(analysis.spendUsd, analysis.budgetCapUsd)
                    }
                    HorizontalDivider(color = Border)
                }
            }
        }

        VigilPanel(title = "Latest brief") {
            val brief = state.latestBrief
            if (brief == null) {
                Text("No briefs yet.", color = Muted)
            } else {
                Text(brief.title, style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(brief.body, color = Muted, style = MaterialTheme.typography.bodyMedium)
            }
        }

        VigilPanel(title = "Signals feed") {
            if (state.signals.isEmpty()) {
                Text("No signals yet.", color = Muted)
            } else {
                state.signals.take(20).forEach { signal ->
                    Column(modifier = Modifier.padding(vertical = 8.dp)) {
                        Text(signal.title, style = MaterialTheme.typography.bodyMedium)
                        Text(signal.detail, color = Muted, style = MaterialTheme.typography.bodyMedium)
                        Text(
                            "${signal.type} · ${signal.severity}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Accent,
                        )
                    }
                    HorizontalDivider(color = Border)
                }
            }
        }
    }
}

@Composable
fun NewAnalysisScreen(
    onCreated: () -> Unit,
    onBack: () -> Unit,
    viewModel: NewAnalysisViewModel = viewModel(),
) {
    val name by viewModel.name.collectAsState()
    val target by viewModel.target.collectAsState()
    val sourceUrl by viewModel.sourceUrl.collectAsState()
    val budget by viewModel.budget.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val created by viewModel.created.collectAsState()

    LaunchedEffect(created) {
        if (created) onCreated()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Bg)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("New analysis", style = MaterialTheme.typography.headlineMedium)
            TextButton(onClick = onBack) { Text("Back", color = Muted) }
        }

        VigilTextField(value = name, onValueChange = { viewModel.name.value = it }, label = "Name")
        VigilTextField(value = target, onValueChange = { viewModel.target.value = it }, label = "Target")
        VigilTextField(
            value = sourceUrl,
            onValueChange = { viewModel.sourceUrl.value = it },
            label = "Source URL",
        )
        VigilTextField(
            value = budget,
            onValueChange = { viewModel.budget.value = it },
            label = "Budget cap (USD)",
        )

        error?.let { Text(it, color = Alert) }

        VigilPrimaryButton(
            text = if (loading) "Creating…" else "Create analysis",
            onClick = viewModel::create,
            enabled = !loading && name.isNotBlank() && target.isNotBlank() && sourceUrl.isNotBlank(),
        )
    }
}
