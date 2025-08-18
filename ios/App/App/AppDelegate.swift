import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    // Inject a small CSS fix for iOS safe area when loading remote content
    injectSafeAreaCss()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

extension AppDelegate {
        /// Injects CSS into the WKWebView to compensate the iOS StatusBar safe area
        /// Useful when loading remote content (Firebase Hosting) where we can't edit CSS locally.
        func injectSafeAreaCss() {
                // Delay slightly to ensure the web content is present
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                        guard let self = self else { return }

                        // Access Capacitor bridge and WKWebView
                        guard let root = self.window?.rootViewController as? CAPBridgeViewController,
                                    let webView = root.bridge?.webView else {
                                return
                        }

                                                let css = """
                                                :root { --ios-safe-inset-top: env(safe-area-inset-top, 54px); }
                                                /* Appliquer au sélecteur direct et avec la classe pour robustesse */
                                                .top-menu,
                                                body.capacitor-ios .top-menu,
                                                .fixed-top,
                                                .sticky-top,
                                                header.site-header,
                                                header.app-header,
                                                nav.navbar-fixed-top {
                                                    padding-top: calc(var(--ios-safe-inset-top) + 12px) !important;
                                                    height: calc(60px + var(--ios-safe-inset-top)) !important;
                                                    box-sizing: border-box !important;
                                                    background: #ffffff !important;
                                                }
                                                .app-container,
                                                body.capacitor-ios .app-container,
                                                main.main-content,
                                                #root > .app {
                                                    padding-top: calc(60px + var(--ios-safe-inset-top)) !important;
                                                }
                                                """

                                                let js = """
                                                (function(){
                                                    function ensureBodyClasses(){
                                                        try { document.body.classList.add('capacitor-ios','statusbar-no-overlay'); } catch(e){}
                                                    }
                                                    function injectCss(){
                                                        try {
                                                            var existing = document.querySelector('style[data-injected="ios-safe-area"]');
                                                            if (!existing) {
                                                                var s = document.createElement('style');
                                                                s.type = 'text/css';
                                                                s.setAttribute('data-injected','ios-safe-area');
                                                                s.innerHTML = `\(css)`;
                                                                document.head.appendChild(s);
                                                            }
                                                        } catch(e){}
                                                    }
                                                    function tryStatusBar(){
                                                        try {
                                                            var SB = (window.Capacitor && (window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar)) || (window.StatusBar);
                                                            if (SB && SB.setOverlaysWebView) { SB.setOverlaysWebView({ overlay: false }); }
                                                            if (SB && SB.setStyle) { SB.setStyle({ style: 'DARK' }); }
                                                        } catch(e){}
                                                    }
                                                                    function ensureViewportFitCover(){
                                                                        try {
                                                                            var vp = document.querySelector('meta[name="viewport"]');
                                                                            if (!vp) {
                                                                                vp = document.createElement('meta');
                                                                                vp.setAttribute('name','viewport');
                                                                                vp.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');
                                                                                document.head.appendChild(vp);
                                                                            } else {
                                                                                var content = vp.getAttribute('content') || '';
                                                                                if (/viewport-fit=/.test(content)) {
                                                                                    content = content.replace(/viewport-fit=\\w+/,'viewport-fit=cover');
                                                                                } else {
                                                                                    content = content ? content + ', viewport-fit=cover' : 'width=device-width, initial-scale=1, viewport-fit=cover';
                                                                                }
                                                                                vp.setAttribute('content', content);
                                                                            }
                                                                        } catch(e){}
                                                                    }
                                                                    function fallbackIfNoTopMenu(){
                                                                        try {
                                                                            // Si aucun header détecté, ajouter un padding-top global au body
                                                                            var hasHeader = document.querySelector('.top-menu, .fixed-top, .sticky-top, header.site-header, header.app-header, nav.navbar-fixed-top');
                                                                            if (!hasHeader) {
                                                                                document.body.style.paddingTop = 'calc(var(--ios-safe-inset-top, 54px) + 12px)';
                                                                            }
                                                                        } catch(e){}
                                                                    }
                                                                    function bootstrap(){
                                                        ensureBodyClasses();
                                                        injectCss();
                                                                        ensureViewportFitCover();
                                                                        fallbackIfNoTopMenu();
                                                        tryStatusBar();
                                                    }
                                                    document.addEventListener('DOMContentLoaded', bootstrap);
                                                    window.addEventListener('hashchange', bootstrap);
                                                    document.addEventListener('visibilitychange', function(){ if (!document.hidden) bootstrap(); });
                                                    // Mutation observer pour restaurer le style si supprimé
                                                    try {
                                                        var obs = new MutationObserver(function(){ injectCss(); });
                                                        obs.observe(document.documentElement || document, { subtree: true, childList: true });
                                                    } catch(e){}
                                                    // Run now as well
                                                    bootstrap();
                                                    return true;
                                                })();
                                                """

                        webView.evaluateJavaScript(js, completionHandler: nil)
                }
        }
}
