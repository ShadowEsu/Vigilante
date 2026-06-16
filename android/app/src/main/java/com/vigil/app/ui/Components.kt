package com.vigil.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.vigil.app.ui.theme.*

@Composable
fun VigilPanel(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Border, RoundedCornerShape(8.dp))
            .background(Surface)
            .padding(16.dp),
    ) {
        Text(
            text = title.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = Muted,
        )
        Spacer(modifier = Modifier.height(12.dp))
        content()
    }
}

@Composable
fun SpendMeter(spend: Double, budget: Double) {
    val pct = if (budget > 0) (spend / budget).coerceIn(0.0, 1.0) else 0.0
    val over = spend >= budget

    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("Spend / budget", style = MaterialTheme.typography.labelSmall, color = Muted)
            Text(
                "$${"%.4f".format(spend)} / $${"%.2f".format(budget)}",
                style = MaterialTheme.typography.labelSmall,
                color = if (over) Alert else Muted,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(Border),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(pct.toFloat())
                    .clip(RoundedCornerShape(2.dp))
                    .background(if (over) Alert else Accent),
            )
        }
    }
}

@Composable
fun VigilPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth(),
        colors = ButtonDefaults.buttonColors(
            containerColor = Accent,
            contentColor = Surface,
        ),
        shape = RoundedCornerShape(6.dp),
    ) {
        Text(text)
    }
}

@Composable
fun VigilTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    singleLine: Boolean = true,
) {
    Column(modifier = modifier) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = Muted)
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = singleLine,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Accent.copy(alpha = 0.5f),
                unfocusedBorderColor = Border,
                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                cursorColor = Accent,
            ),
            shape = RoundedCornerShape(6.dp),
        )
    }
}
