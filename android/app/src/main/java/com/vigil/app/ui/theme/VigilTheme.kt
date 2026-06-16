package com.vigil.app.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.sp

val Bg = Color(0xFF0A0B0E)
val Surface = Color(0xFF12141A)
val Surface2 = Color(0xFF181B23)
val Accent = Color(0xFF6E7BFF)
val Live = Color(0xFF3ECF8E)
val Alert = Color(0xFFE8A13A)
val Muted = Color(0x73FFFFFF)
val Border = Color(0x14FFFFFF)

val Mono = FontFamily.Monospace

val VigilTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontSize = 14.sp,
    ),
    labelSmall = TextStyle(
        fontFamily = Mono,
        fontSize = 10.sp,
        letterSpacing = 1.sp,
    ),
)
