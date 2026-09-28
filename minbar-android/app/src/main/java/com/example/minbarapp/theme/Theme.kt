package com.example.minbarapp.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = EmeraldLight,
    onPrimary = CharcoalDark,
    secondary = GoldAccent,
    onSecondary = CharcoalDark,
    tertiary = EmeraldPale,
    background = CharcoalDark,
    surface = CharcoalSurface,
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
)

private val LightColorScheme = lightColorScheme(
    primary = EmeraldPrimary,
    onPrimary = Color.White,
    secondary = GoldAccent,
    onSecondary = Color.White,
    tertiary = EmeraldDark,
    background = SandBackground,
    surface = Color.White,
    onBackground = CharcoalText,
    onSurface = CharcoalText,
)

@Composable
fun MinbarAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
