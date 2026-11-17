package io.github.abhijeet2653.flare21;

import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Applies AppTheme.NoActionBarLaunch as the android 12+ splash and then
        // switches to postSplashScreenTheme. Must run before super.onCreate().
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
