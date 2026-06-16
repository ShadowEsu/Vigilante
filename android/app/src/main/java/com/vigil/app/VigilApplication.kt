package com.vigil.app

import android.app.Application
import com.vigil.app.data.VigilRepository

class VigilApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        VigilRepository.get(this)
    }
}
