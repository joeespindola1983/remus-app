@file:Suppress("DEPRECATION")
package com.remusapp.recording

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RemusRecordingPackage : ReactPackage {
  @Deprecated("Deprecated in Java")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(RemusRecordingModule(reactContext))
  }

  @Deprecated("Deprecated in Java")
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
