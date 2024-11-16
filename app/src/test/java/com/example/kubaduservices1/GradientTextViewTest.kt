package com.example.kubaduservices1

import android.content.Context
import android.graphics.LinearGradient
import android.graphics.Shader
import android.graphics.Color
import org.junit.Test
import org.junit.Before
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.junit.Assert.*

@RunWith(RobolectricTestRunner::class)
class GradientTextViewTest {
    private lateinit var gradientTextView: GradientTextView

    @Before
    fun setup() {
        gradientTextView = GradientTextView(RuntimeEnvironment.getApplication())
    }

    @Test
    fun testGradientColors() {
        val colors = gradientTextView.getGradientColors()
        assertEquals(2, colors.size)
        assertEquals(Color.parseColor("#004AAD"), colors[0]) // Start color (Blue)
        assertEquals(Color.parseColor("#00BF63"), colors[1]) // End color (Green)
    }

    @Test
    fun testGradientDirection() {
        gradientTextView.measure(500, 200) // Set some dimensions
        gradientTextView.layout(0, 0, 500, 200)
        
        val direction = gradientTextView.getGradientDirection()
        assertTrue(direction.x1 >= 0f)
        assertTrue(direction.y1 >= 0f)
        assertTrue(direction.x2 <= gradientTextView.width.toFloat())
        assertTrue(direction.y2 <= gradientTextView.height.toFloat())
    }

    @Test
    fun testDefaultGradientDirection() {
        val direction = gradientTextView.getGradientDirection()
        assertEquals(0f, direction.x1)
        assertEquals(0f, direction.y1)
        assertTrue(direction.x2 >= 0f)
        assertTrue(direction.y2 >= 0f)
    }

    @Test
    fun testShaderType() {
        gradientTextView.measure(500, 200) // Set some dimensions
        gradientTextView.layout(0, 0, 500, 200)
        
        val shader = gradientTextView.paint.shader
        assertTrue(shader is LinearGradient)
    }
}
