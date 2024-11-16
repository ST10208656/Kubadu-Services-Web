package com.example.kubaduservices1

import android.content.Context
import android.graphics.LinearGradient
import android.graphics.Shader
import android.graphics.Color
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatTextView

class GradientTextView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatTextView(context, attrs, defStyleAttr) {

    private val startColor = Color.parseColor("#004AAD")  // Orange
    private val endColor = Color.parseColor("#00BF63")    // Red

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        if (changed) {
            paint.shader = createGradient()
        }
    }

    private fun createGradient(): Shader {
        return LinearGradient(
            0f, 0f,         // Start coordinates (top-left)
            width.toFloat(), 0f,  // End coordinates (top-right, horizontal gradient)
            startColor,
            endColor,
            Shader.TileMode.CLAMP
        )
    }

    // Methods for testing
    fun getGradientColors(): List<Int> = listOf(startColor, endColor)

    fun getGradientDirection(): GradientDirection = GradientDirection(
        0f, 0f, width.toFloat(), height.toFloat()
    )
}

data class GradientDirection(
    val x1: Float,
    val y1: Float,
    val x2: Float,
    val y2: Float
)
