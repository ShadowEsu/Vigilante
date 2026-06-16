package com.vigil.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.vigil.app.data.VigilRepository
import com.vigil.app.ui.AuthViewModel
import com.vigil.app.ui.screens.AuthScreen
import com.vigil.app.ui.screens.DashboardScreen
import com.vigil.app.ui.screens.NewAnalysisScreen
import com.vigil.app.ui.theme.Bg
import com.vigil.app.ui.theme.VigilTypography
import io.github.jan.supabase.auth.handleDeeplinks
import kotlinx.coroutines.runBlocking

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        handleAuthDeepLink(intent)

        setContent {
            MaterialTheme(typography = VigilTypography) {
                Surface(modifier = Modifier.fillMaxSize(), color = Bg) {
                    VigilNavHost(onDeepLink = { handleAuthDeepLink(it) })
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleAuthDeepLink(intent)
    }

    private fun handleAuthDeepLink(intent: Intent?) {
        intent ?: return
        runBlocking {
            try {
                VigilRepository.get(this@MainActivity).auth.handleDeeplinks(intent)
            } catch (_: Exception) {
                // Deep link may not always be auth-related
            }
        }
    }
}

@Composable
private fun VigilNavHost(onDeepLink: (Intent) -> Unit) {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    var startDestination by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        val signedIn = authViewModel.isSignedIn.value
        startDestination = if (signedIn) "dashboard" else "auth"
    }

    if (startDestination == null) return

    NavHost(
        navController = navController,
        startDestination = startDestination!!,
    ) {
        composable("auth") {
            AuthScreen(
                onSignedIn = {
                    navController.navigate("dashboard") {
                        popUpTo("auth") { inclusive = true }
                    }
                },
            )
        }
        composable("dashboard") {
            DashboardScreen(
                onNewAnalysis = { navController.navigate("new") },
                onSignOut = {
                    authViewModel.signOut()
                    navController.navigate("auth") {
                        popUpTo("dashboard") { inclusive = true }
                    }
                },
            )
        }
        composable("new") {
            NewAnalysisScreen(
                onCreated = {
                    navController.popBackStack()
                },
                onBack = { navController.popBackStack() },
            )
        }
    }
}
