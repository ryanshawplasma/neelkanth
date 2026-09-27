package com.neelkanth.myapp;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/**
 * The app shell: DivyaDham's website (capacitor.config.ts, server.url) in a web view.
 *
 * The back key. Capacitor 8 does nothing with it on its own, so Android's
 * default ran, which closes the app: someone who opened a pooja from the home
 * page and pressed back to see another was dropped onto the launcher. The web
 * view keeps its own history (every page opened, including Next.js's client-side
 * navigations), so the right answer is the browser's: go back while there is
 * somewhere to go, and only on the first page let Android do what back does
 * everywhere else. Registered through the AndroidX dispatcher, not the
 * deprecated onBackPressed, so Android 13+'s predictive back still works.
 * The same fix as Dino's shell (ryanshawplasma/dino), where the owner reported it.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = bridge == null ? null : bridge.getWebView();
                if (web != null && web.canGoBack()) {
                    web.goBack();
                    return;
                }
                // Nothing behind this page: hand the press to Android, once.
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            }
        });
    }
}
