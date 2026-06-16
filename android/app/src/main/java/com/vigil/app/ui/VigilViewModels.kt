package com.vigil.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vigil.app.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardState(
    val loading: Boolean = true,
    val analyses: List<Analysis> = emptyList(),
    val signals: List<Signal> = emptyList(),
    val latestBrief: Brief? = null,
    val error: String? = null,
    val runMessage: String? = null,
)

class DashboardViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = VigilRepository.get(app)

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            try {
                val userId = repo.currentUserId()
                if (userId == null) {
                    _state.value = DashboardState(loading = false)
                    return@launch
                }
                val analyses = repo.fetchAnalyses(userId)
                val ids = analyses.map { it.id }
                val signals = repo.fetchSignals(ids)
                val brief = repo.fetchLatestBrief(ids)
                _state.value = DashboardState(
                    loading = false,
                    analyses = analyses,
                    signals = signals,
                    latestBrief = brief,
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    loading = false,
                    error = e.message ?: "Failed to load dashboard",
                )
            }
        }
    }

    fun runAnalysis(analysisId: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(runMessage = "Running…")
            try {
                val result = repo.runAnalysis(analysisId)
                val message = when {
                    result.error != null -> result.error
                    result.skipped == true -> result.reason ?: "Skipped"
                    result.baselineCreated == true && result.briefCreated != true ->
                        "Baseline saved · run again after page changes"
                    else -> buildString {
                        append("Done")
                        result.signalsCreated?.let { append(" · $it signal(s)") }
                        if (result.briefCreated == true) append(" · brief created")
                    }
                }
                _state.value = _state.value.copy(runMessage = message)
                refresh()
            } catch (e: Exception) {
                _state.value = _state.value.copy(runMessage = e.message ?: "Run failed")
            }
        }
    }

    fun clearRunMessage() {
        _state.value = _state.value.copy(runMessage = null)
    }
}

class AuthViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = VigilRepository.get(app)

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _sent = MutableStateFlow(false)
    val sent: StateFlow<Boolean> = _sent.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _isSignedIn = MutableStateFlow(false)
    val isSignedIn: StateFlow<Boolean> = _isSignedIn.asStateFlow()

    init {
        viewModelScope.launch {
            _isSignedIn.value = repo.currentUserId() != null
        }
    }

    fun setEmail(value: String) {
        _email.value = value
    }

    fun sendMagicLink() {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                repo.signInWithMagicLink(_email.value.trim())
                _sent.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to send link"
            } finally {
                _loading.value = false
            }
        }
    }

    fun onDeepLink() {
        viewModelScope.launch {
            _isSignedIn.value = repo.currentUserId() != null
        }
    }

    fun signOut() {
        viewModelScope.launch {
            repo.signOut()
            _isSignedIn.value = false
            _sent.value = false
        }
    }
}

class NewAnalysisViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = VigilRepository.get(app)

    var name = MutableStateFlow("")
    var targetType = MutableStateFlow("company")
    var target = MutableStateFlow("")
    var sourceUrl = MutableStateFlow("")
    var model = MutableStateFlow("claude-sonnet")
    var budget = MutableStateFlow("10")
    var cadence = MutableStateFlow(1440)

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _created = MutableStateFlow(false)
    val created: StateFlow<Boolean> = _created.asStateFlow()

    fun create() {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val userId = repo.currentUserId()
                    ?: throw IllegalStateException("Not authenticated")

                repo.createAnalysis(
                    NewAnalysisInput(
                        userId = userId,
                        name = name.value.trim(),
                        targetType = targetType.value,
                        target = target.value.trim(),
                        sources = listOf(sourceUrl.value.trim()),
                        cadenceMinutes = cadence.value,
                        model = model.value,
                        budgetCapUsd = budget.value.toDoubleOrNull() ?: 10.0,
                        nextRunAt = nowIso(),
                    )
                )
                _created.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to create analysis"
            } finally {
                _loading.value = false
            }
        }
    }
}
