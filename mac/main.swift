// Looks Good — native macOS wrapper (AppKit + WKWebView).
// Serves the bundled web app from app://local/ so localStorage has a stable,
// persistent origin, and bridges the few things a bare WKWebView can't do:
// file downloads, file pickers, dialogs and the clipboard.

import AppKit
import WebKit
import UniformTypeIdentifiers

let appName = "Looks Good"
let chromeColor = NSColor(srgbRed: 0xF7 / 255.0, green: 0xF6 / 255.0, blue: 0xF3 / 255.0, alpha: 1)
let scheme = "app"

// MARK: - Scheme handler

final class WebSchemeHandler: NSObject, WKURLSchemeHandler {
    let root: URL

    init(root: URL) { self.root = root.standardizedFileURL }

    private static let mime: [String: String] = [
        "html": "text/html; charset=utf-8", "css": "text/css; charset=utf-8",
        "js": "text/javascript; charset=utf-8", "json": "application/json",
        "svg": "image/svg+xml", "png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "gif": "image/gif", "webp": "image/webp", "ico": "image/x-icon",
        "woff": "font/woff", "woff2": "font/woff2", "wasm": "application/wasm", "txt": "text/plain; charset=utf-8",
    ]

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else { task.didFailWithError(URLError(.badURL)); return }
        var rel = url.path.removingPercentEncoding ?? url.path
        if rel.isEmpty || rel == "/" { rel = "/index.html" }
        let file = root.appendingPathComponent(String(rel.dropFirst())).standardizedFileURL
        // Never serve anything outside the bundled web folder.
        guard file.path.hasPrefix(root.path + "/"),
              let data = try? Data(contentsOf: file) else {
            let r = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1",
                                    headerFields: ["Content-Type": "text/plain"])!
            task.didReceive(r); task.didReceive(Data("Not found".utf8)); task.didFinish()
            return
        }
        let type = Self.mime[file.pathExtension.lowercased()] ?? "application/octet-stream"
        let r = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
            "Content-Type": type, "Content-Length": String(data.count), "Cache-Control": "no-cache",
        ])!
        task.didReceive(r); task.didReceive(data); task.didFinish()
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

// MARK: - Native-only page script

// Injected into every page. Watches the "Download all" button so the native
// side can ask for ONE destination folder instead of five save panels.
let batchUserScript = """
(function () {
  const post = m => window.webkit.messageHandlers.batch.postMessage(m);
  function attach() {
    const btn = document.getElementById('downloadAllSlides');
    if (!btn) return;
    let active = false;
    btn.addEventListener('click', () => { active = true; post('start'); }, true);
    new MutationObserver(() => {
      if (active && !btn.disabled) { active = false; post('end'); }
    }).observe(btn, { attributes: true, attributeFilter: ['disabled'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
"""

// Marks the page as running inside the Mac wrapper so the CSS can inset the
// sidebar brand past the traffic lights.
let macClassUserScript = "document.documentElement.classList.add('is-mac-app');"

// MARK: - Drag strip

/// Transparent strip across the top of the window. The web view can't move the
/// window, so this does: drag to move, double-click to zoom/minimise per the
/// user's system setting. The web layout keeps the same 28px free of controls.
final class DragStrip: NSView {
    static let height: CGFloat = 28

    override var mouseDownCanMoveWindow: Bool { true }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override func mouseDown(with event: NSEvent) {
        guard let window = window else { return }
        if event.clickCount == 2 {
            let action = UserDefaults.standard.string(forKey: "AppleActionOnDoubleClick") ?? "Maximize"
            switch action {
            case "Minimize": window.performMiniaturize(nil)
            case "None": break
            default: window.performZoom(nil)
            }
            return
        }
        window.performDrag(with: event)
    }
}

// MARK: - App delegate

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate,
                         WKDownloadDelegate, WKScriptMessageHandler, WKScriptMessageHandlerWithReply, NSWindowDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var dragStrip: DragStrip!
    var zoom: CGFloat = 1

    // Download-all batching
    var batchActive = false
    var batchFolder: URL?
    var batchCancelled = false
    var batchSaved: [URL] = []
    var batchWhat = "the slide pictures"

    // MARK: launch

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildMenus()
        buildWindow()
        NSApp.activate(ignoringOtherApps: true)
        #if TESTHOOK
        startTestHook()
        #endif
    }

    func buildWindow() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = WKWebsiteDataStore.default()   // persistent localStorage
        // Element full screen (requestFullscreen) so the deck's present mode fills the screen.
        if #available(macOS 12.3, *) { config.preferences.isElementFullscreenEnabled = true }
        let webRoot = Bundle.main.resourceURL!.appendingPathComponent("web")
        config.setURLSchemeHandler(WebSchemeHandler(root: webRoot), forURLScheme: scheme)
        let ucc = config.userContentController
        ucc.add(self, name: "clipboard")
        ucc.add(self, name: "batch")
        ucc.addScriptMessageHandler(self, contentWorld: .page, name: "library")
        ucc.addScriptMessageHandler(self, contentWorld: .page, name: "capture")
        ucc.addScriptMessageHandler(self, contentWorld: .page, name: "wallpaper")
        ucc.addUserScript(WKUserScript(source: macClassUserScript, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        ucc.addUserScript(WKUserScript(source: batchUserScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true))

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.underPageBackgroundColor = chromeColor
        webView.allowsBackForwardNavigationGestures = false
        #if TESTHOOK
        if #available(macOS 13.3, *) { webView.isInspectable = true }
        #endif

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1360, height: 880),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                          backing: .buffered, defer: false)
        window.title = appName                       // still used by the Window menu / Dock
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isReleasedWhenClosed = false
        window.minSize = NSSize(width: 760, height: 560)
        window.backgroundColor = chromeColor
        // Web view fills the whole window (edge to edge, under the transparent
        // titlebar); the drag strip sits on top of it.
        let container = NSView()
        webView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            webView.topAnchor.constraint(equalTo: container.topAnchor),
            webView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
        ])
        dragStrip = DragStrip()
        dragStrip.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(dragStrip, positioned: .above, relativeTo: webView)
        NSLayoutConstraint.activate([
            dragStrip.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            dragStrip.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            dragStrip.topAnchor.constraint(equalTo: container.topAnchor),
            dragStrip.heightAnchor.constraint(equalToConstant: DragStrip.height),
        ])
        window.contentView = container
        window.delegate = self
        if !window.setFrameUsingName("MainWindow") { window.center() }
        window.setFrameAutosaveName("MainWindow")
        window.makeKeyAndOrderFront(nil)
        webView.load(URLRequest(url: URL(string: "\(scheme)://local/index.html")!))
    }

    // Full screen hides the traffic lights: tell the page so it can drop the inset,
    // and retire the drag strip (the system reveals its own titlebar at the top edge).
    func windowWillEnterFullScreen(_ notification: Notification) { setFullScreen(true) }
    func windowDidExitFullScreen(_ notification: Notification) { setFullScreen(false) }
    func setFullScreen(_ on: Bool) {
        dragStrip.isHidden = on
        webView.evaluateJavaScript("document.documentElement.classList.toggle('is-fullscreen', \(on))")
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag { window.makeKeyAndOrderFront(nil) }
        return true
    }

    // MARK: menus

    func buildMenus() {
        let main = NSMenu()
        NSApp.mainMenu = main

        func add(_ menu: NSMenu, _ title: String, _ action: Selector?, _ key: String = "",
                 _ mods: NSEvent.ModifierFlags = [.command], target: AnyObject? = nil) {
            let item = menu.addItem(withTitle: title, action: action, keyEquivalent: key)
            item.keyEquivalentModifierMask = mods
            item.target = target
        }
        func top(_ title: String) -> NSMenu {
            let item = main.addItem(withTitle: title, action: nil, keyEquivalent: "")
            let m = NSMenu(title: title)
            item.submenu = m
            return m
        }

        let app = top(appName)
        add(app, "About \(appName)", #selector(showAbout), target: self)
        app.addItem(.separator())
        add(app, "Hide \(appName)", #selector(NSApplication.hide(_:)), "h")
        add(app, "Hide Others", #selector(NSApplication.hideOtherApplications(_:)), "h", [.command, .option])
        add(app, "Show All", #selector(NSApplication.unhideAllApplications(_:)))
        app.addItem(.separator())
        add(app, "Quit \(appName)", #selector(NSApplication.terminate(_:)), "q")

        let file = top("File")
        func fileItem(_ title: String, _ cmd: String, _ key: String, _ mods: NSEvent.ModifierFlags = [.command]) {
            let item = file.addItem(withTitle: title, action: #selector(menuCommand(_:)), keyEquivalent: key)
            item.keyEquivalentModifierMask = mods
            item.target = self
            item.representedObject = cmd
        }
        fileItem("New Brand\u{2026}", "new", "n")
        file.addItem(.separator())
        fileItem("Save", "save", "s")
        fileItem("Save as New Brand\u{2026}", "saveAs", "s", [.command, .shift])
        fileItem("Revert to Saved", "revert", "")
        file.addItem(.separator())
        fileItem("Back to Library", "library", "l", [.command, .shift])
        file.addItem(.separator())
        add(file, "Close Window", #selector(NSWindow.performClose(_:)), "w")

        let edit = top("Edit")
        add(edit, "Undo", Selector(("undo:")), "z")
        add(edit, "Redo", Selector(("redo:")), "z", [.command, .shift])
        edit.addItem(.separator())
        add(edit, "Cut", #selector(NSText.cut(_:)), "x")
        add(edit, "Copy", #selector(NSText.copy(_:)), "c")
        add(edit, "Paste", #selector(NSText.paste(_:)), "v")
        add(edit, "Select All", #selector(NSText.selectAll(_:)), "a")

        let view = top("View")
        add(view, "Reload", #selector(reload), "r", target: self)
        view.addItem(.separator())
        add(view, "Actual Size", #selector(zoomReset), "0", target: self)
        add(view, "Zoom In", #selector(zoomIn), "+", target: self)
        add(view, "Zoom Out", #selector(zoomOut), "-", target: self)
        // ⌘= is what people actually press for "⌘+" on a US keyboard.
        let alt = view.addItem(withTitle: "Zoom In", action: #selector(zoomIn), keyEquivalent: "=")
        alt.target = self; alt.isHidden = true
        view.addItem(.separator())
        add(view, "Showcase Mode", #selector(toggleShowcase), "d", [.command, .shift], target: self)
        view.addItem(.separator())
        add(view, "Enter Full Screen", #selector(NSWindow.toggleFullScreen(_:)), "f", [.command, .control])

        let win = top("Window")
        add(win, "Minimize", #selector(NSWindow.performMiniaturize(_:)), "m")
        add(win, "Zoom", #selector(NSWindow.performZoom(_:)))
        win.addItem(.separator())
        add(win, "Close", #selector(NSWindow.performClose(_:)))
        win.addItem(.separator())
        add(win, "Bring All to Front", #selector(NSApplication.arrangeInFront(_:)))
        NSApp.windowsMenu = win
    }

    @objc func reload() { webView.reload() }
    /// Showcase mode (js/showcase.js): only the curated aesthetics, owner-only tools hidden.
    @objc func toggleShowcase() {
        webView.evaluateJavaScript("window.toggleShowcase && window.toggleShowcase()")
    }

    // MARK: About box

    /// The standard About panel, with credits for the bundled fonts (fonts/CREDITS.txt,
    /// written by dev/font-credits.swift) and the export libraries.
    @objc func showAbout() {
        let base = NSFont.systemFont(ofSize: NSFont.smallSystemFontSize)
        let bold = NSFont.boldSystemFont(ofSize: NSFont.smallSystemFontSize)
        let para = NSMutableParagraphStyle()
        para.alignment = .center
        para.paragraphSpacing = 6
        let credits = NSMutableAttributedString()
        func add(_ text: String, _ font: NSFont, _ color: NSColor = .labelColor) {
            credits.append(NSAttributedString(string: text, attributes: [
                .font: font, .foregroundColor: color, .paragraphStyle: para]))
        }
        // fonts/CREDITS.txt: "Family\n  Licence\n  Copyright\n\n" blocks after a header.
        var byLicence: [String: [String]] = [:]
        let creditsFile = Bundle.main.resourceURL!.appendingPathComponent("web/fonts/CREDITS.txt")
        if let text = try? String(contentsOf: creditsFile, encoding: .utf8) {
            for block in text.components(separatedBy: "\n\n") {
                let lines = block.components(separatedBy: "\n")
                guard lines.count >= 2, !lines[0].hasPrefix(" "), lines[1].hasPrefix("  "),
                      !lines[0].contains("=") else { continue }
                byLicence[lines[1].trimmingCharacters(in: .whitespaces), default: []].append(lines[0])
            }
        }
        add("Design a brand, see it in many design languages, and brief an AI coding tool to build it.\n\n", base)
        add("Libraries\n", bold)
        add("html2canvas 1.4.1 by Niklas von Hertzen, MIT License\njsPDF 2.5.1 by James Hall and yWorks, MIT License\n\n", base)
        let total = byLicence.values.reduce(0) { $0 + $1.count }
        add("Fonts\n", bold)
        add("\(total) typefaces from Google Fonts, bundled so the app works offline. Thank you to their designers.\n\n", base)
        for licence in byLicence.keys.sorted() {
            add("\(licence)\n", bold, .secondaryLabelColor)
            add(byLicence[licence]!.sorted().joined(separator: ", ") + "\n\n", base, .secondaryLabelColor)
        }
        add("Full copyright notices: Looks Good.app/Contents/Resources/web/fonts/CREDITS.txt", base, .tertiaryLabelColor)
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: appName,
            .credits: credits,
        ])
    }
    @objc func zoomIn() { setZoom(zoom + 0.1) }
    @objc func zoomOut() { setZoom(zoom - 0.1) }
    @objc func zoomReset() { setZoom(1) }
    func setZoom(_ z: CGFloat) {
        zoom = min(3, max(0.5, (z * 10).rounded() / 10))
        webView.pageZoom = zoom
        UserDefaults.standard.set(Double(zoom), forKey: "pageZoom")
    }

    // MARK: navigation

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let saved = UserDefaults.standard.double(forKey: "pageZoom")
        if saved > 0, zoom == 1 { setZoom(CGFloat(saved)) }
        if window.styleMask.contains(.fullScreen) { setFullScreen(true) }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if navigationAction.shouldPerformDownload { decisionHandler(.download); return }
        // The window only ever shows the app's own pages: the library bridge must
        // never be reachable from a remote page. Web links open in the browser.
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.scheme == scheme || url.absoluteString == "about:blank" { decisionHandler(.allow); return }
        if (url.scheme == "http" || url.scheme == "https"),
           navigationAction.navigationType == .linkActivated {
            NSWorkspace.shared.open(url)
        }
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse,
                 decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        decisionHandler(navigationResponse.canShowMIMEType ? .allow : .download)
    }

    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
        download.delegate = self
    }
    func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) {
        download.delegate = self
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, url.scheme == "http" || url.scheme == "https" {
            NSWorkspace.shared.open(url)
        }
        return nil
    }

    // MARK: downloads

    var downloadTargets: [ObjectIdentifier: URL] = [:]

    func uniqueURL(in folder: URL, name: String) -> URL {
        let fm = FileManager.default
        let base = (name as NSString).deletingPathExtension
        let ext = (name as NSString).pathExtension
        var candidate = folder.appendingPathComponent(name)
        var n = 2
        while fm.fileExists(atPath: candidate.path) {
            candidate = folder.appendingPathComponent(ext.isEmpty ? "\(base) \(n)" : "\(base) \(n).\(ext)")
            n += 1
        }
        return candidate
    }

    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse,
                  suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        let name = suggestedFilename.isEmpty ? "download" : suggestedFilename
        var dest: URL?

        #if TESTHOOK
        if let dir = ProcessInfo.processInfo.environment["BD_HOOK_DIR"] {
            if batchActive {   // exercise the batch path without the folder panel
                if batchFolder == nil {
                    batchFolder = URL(fileURLWithPath: dir).appendingPathComponent("batch")
                    try? FileManager.default.createDirectory(at: batchFolder!, withIntermediateDirectories: true)
                }
                dest = uniqueURL(in: batchFolder!, name: name)
                downloadTargets[ObjectIdentifier(download)] = dest
                completionHandler(dest)
                return
            }
            dest = uniqueURL(in: URL(fileURLWithPath: dir), name: name)
            downloadTargets[ObjectIdentifier(download)] = dest
            completionHandler(dest)
            return
        }
        #endif

        if batchActive {
            if batchCancelled { completionHandler(nil); return }
            if batchFolder == nil {
                let panel = NSOpenPanel()
                panel.canChooseFiles = false
                panel.canChooseDirectories = true
                panel.canCreateDirectories = true
                panel.allowsMultipleSelection = false
                panel.prompt = "Save Here"
                panel.message = "Choose a folder for \(batchWhat)."
                panel.directoryURL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
                if panel.runModal() == .OK, let url = panel.url { batchFolder = url } else { batchCancelled = true }
            }
            if let folder = batchFolder { dest = uniqueURL(in: folder, name: name) }
        } else {
            let panel = NSSavePanel()
            panel.nameFieldStringValue = name
            panel.canCreateDirectories = true
            panel.directoryURL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
            if let type = UTType(filenameExtension: (name as NSString).pathExtension) {
                panel.allowedContentTypes = [type]
            }
            if panel.runModal() == .OK { dest = panel.url }
        }

        if let dest = dest {
            // The user (or batch folder) already approved this path; replace silently.
            try? FileManager.default.removeItem(at: dest)
            downloadTargets[ObjectIdentifier(download)] = dest
        }
        completionHandler(dest)
    }

    func downloadDidFinish(_ download: WKDownload) {
        guard let url = downloadTargets.removeValue(forKey: ObjectIdentifier(download)) else { return }
        if batchActive { batchSaved.append(url) }
    }

    func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        downloadTargets.removeValue(forKey: ObjectIdentifier(download))
        if (error as NSError).domain == NSURLErrorDomain, (error as NSError).code == NSURLErrorCancelled { return }   // user cancelled the panel
        NSLog("Download failed: \(error.localizedDescription)")
        let alert = NSAlert()
        alert.messageText = "The download failed"
        alert.informativeText = error.localizedDescription
        alert.runModal()
    }

    // MARK: JS -> native messages

    func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.request.url?.scheme == scheme else { return }
        switch message.name {
        case "clipboard":
            if let text = message.body as? String {
                let pb = NSPasteboard.general
                pb.clearContents()
                pb.setString(text, forType: .string)
            }
        case "batch":
            // 'start' / 'end', or { op: 'start', what: 'the video frames' } so the folder
            // panel can say what is being saved.
            let dict = message.body as? [String: Any]
            let op = (message.body as? String) ?? (dict?["op"] as? String) ?? ""
            if op == "start" {
                batchActive = true; batchFolder = nil; batchCancelled = false; batchSaved = []
                let what = (dict?["what"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
                batchWhat = what.isEmpty || what.count > 60 ? "the slide pictures" : what
            } else if op == "end" {
                // Downloads finish asynchronously; give the last one a moment.
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [self] in
                    let files = batchSaved
                    batchActive = false; batchFolder = nil; batchCancelled = false; batchSaved = []
                    if !files.isEmpty { NSWorkspace.shared.activateFileViewerSelecting(files) }
                }
            }
        default: break
        }
    }

    // MARK: brand library (one JSON file per brand)

    /// ~/Library/Application Support/Branding Designer/brands
    lazy var brandsDir: URL = {
        #if TESTHOOK
        let folder = "Branding Designer Test"
        #else
        let folder = "Branding Designer"
        #endif
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let dir = base.appendingPathComponent(folder).appendingPathComponent("brands")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    /// ~/Library/Application Support/Branding Designer/logos (Logos mode documents)
    lazy var logosDir: URL = {
        let dir = brandsDir.deletingLastPathComponent().appendingPathComponent("logos")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    /// The folder for a `library` message: no collection = brands (unchanged); "logos" = logos; anything else is refused.
    func libraryDir(_ collection: String?) -> URL? {
        guard let c = collection else { return brandsDir }
        return c == "logos" ? logosDir : nil
    }

    func libraryFile(_ id: String, in dir: URL) -> URL? {
        // ids are hex from the web layer; refuse anything that could leave the folder
        let ok = !id.isEmpty && id.count <= 64 && id.allSatisfy { $0.isLetter || $0.isNumber || $0 == "-" || $0 == "_" }
        return ok ? dir.appendingPathComponent("\(id).json") : nil
    }

    func brandFile(_ id: String) -> URL? { libraryFile(id, in: brandsDir) }

    func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard message.frameInfo.request.url?.scheme == scheme else { replyHandler(nil, "denied"); return }
        if message.name == "capture" { capture(message.body, replyHandler); return }
        if message.name == "wallpaper" { wallpaper(message.body, replyHandler); return }
        guard message.name == "library", let body = message.body as? [String: Any],
              let op = body["op"] as? String else { replyHandler(nil, "bad request"); return }
        guard let dir = libraryDir(body["collection"] as? String) else { replyHandler(nil, "unknown collection"); return }
        let fm = FileManager.default
        switch op {
        case "list":
            let files = (try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? []
            // [file name without .json, file text]; JS keys each record by its file name.
            let rows: [[String]] = files.filter { $0.pathExtension == "json" }
                .map { [$0.deletingPathExtension().lastPathComponent, (try? String(contentsOf: $0, encoding: .utf8)) ?? ""] }
            replyHandler(rows, nil)
        case "get":
            guard let id = body["id"] as? String, let url = libraryFile(id, in: dir) else { replyHandler(nil, "bad id"); return }
            replyHandler(try? String(contentsOf: url, encoding: .utf8), nil)
        case "put":
            guard let id = body["id"] as? String, let url = libraryFile(id, in: dir), let json = body["json"] as? String else {
                replyHandler(false, "bad request"); return
            }
            do {
                try json.write(to: url, atomically: true, encoding: .utf8)   // atomic: temp file + rename
                replyHandler(true, nil)
            } catch {
                replyHandler(false, error.localizedDescription)
            }
        case "delete":
            guard let id = body["id"] as? String, let url = libraryFile(id, in: dir) else { replyHandler(nil, "bad id"); return }
            try? fm.removeItem(at: url)
            replyHandler(true, nil)
        default:
            replyHandler(nil, "unknown op")
        }
    }

    // MARK: desktop picture (Patterns > "Set as desktop picture")

    /// ~/Library/Application Support/Branding Designer/Wallpapers (the newest few are kept)
    lazy var wallpapersDir: URL = {
        #if TESTHOOK
        let folder = "Branding Designer Test"
        #else
        let folder = "Branding Designer"
        #endif
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let dir = base.appendingPathComponent(folder).appendingPathComponent("Wallpapers")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()
    static let wallpapersKept = 10

    /// js/patterns-ui.js talks to this through window.webkit.messageHandlers.wallpaper.postMessage:
    ///   { op: 'screen' }                 -> { w, h, scale }  the main screen in real pixels
    ///   { op: 'set', name, png }         -> true             png is base64; written to Wallpapers/<name>-<time>.png
    ///                                                        and set as the desktop picture on every screen
    func wallpaper(_ raw: Any, _ reply: @escaping (Any?, String?) -> Void) {
        guard let body = raw as? [String: Any], let op = body["op"] as? String else { reply(nil, "bad request"); return }
        if op == "screen" {
            guard let screen = window.screen ?? NSScreen.main ?? NSScreen.screens.first else { reply(nil, "no screen"); return }
            let k = screen.backingScaleFactor
            reply(["w": Int((screen.frame.width * k).rounded()), "h": Int((screen.frame.height * k).rounded()), "scale": Double(k)], nil)
            return
        }
        guard op == "set", let b64 = body["png"] as? String, let data = Data(base64Encoded: b64),
              data.count > 8, data.count < 120_000_000,
              data.prefix(4) == Data([0x89, 0x50, 0x4E, 0x47]) else { reply(false, "bad picture"); return }
        // file name: letters, digits, dash only, so nothing can leave the folder
        let rawName = (body["name"] as? String) ?? "pattern"
        var slug = String(rawName.unicodeScalars.map { CharacterSet.alphanumerics.contains($0) && $0.isASCII ? Character($0) : "-" }).lowercased()
        while slug.contains("--") { slug = slug.replacingOccurrences(of: "--", with: "-") }
        slug = String(slug.trimmingCharacters(in: CharacterSet(charactersIn: "-")).prefix(60))
        if slug.isEmpty { slug = "pattern" }
        let stamp = Int(Date().timeIntervalSince1970 * 1000)
        let url = wallpapersDir.appendingPathComponent("\(slug)-\(stamp).png")
        let fm = FileManager.default
        do {
            try data.write(to: url, options: .atomic)
            var failed: String?
            // fill the screen (crop the overflow) rather than letterbox
            let options: [NSWorkspace.DesktopImageOptionKey: Any] = [
                .imageScaling: NSImageScaling.scaleProportionallyUpOrDown.rawValue,
                .allowClipping: true,
            ]
            for screen in NSScreen.screens {
                do { try NSWorkspace.shared.setDesktopImageURL(url, for: screen, options: options) }
                catch { failed = error.localizedDescription }
            }
            // keep the newest few pictures
            let files = ((try? fm.contentsOfDirectory(at: wallpapersDir, includingPropertiesForKeys: [.contentModificationDateKey])) ?? [])
                .filter { $0.pathExtension.lowercased() == "png" }
                .sorted { a, b in
                    let da = (try? a.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
                    let db = (try? b.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
                    return da > db
                }
            for old in files.dropFirst(Self.wallpapersKept) where old != url { try? fm.removeItem(at: old) }
            if let failed = failed { reply(false, failed) } else { reply(true, nil) }
        } catch {
            reply(false, error.localizedDescription)
        }
    }

    // MARK: native capture (exports that look exactly like the screen)

    /// js/brand-deck.js asks for a picture of part of the page through
    /// window.webkit.messageHandlers.capture.postMessage({ op: 'snapshot', rect: [x, y, w, h],
    /// pixelWidth, format: 'png' | 'jpeg', quality }). rect is in CSS px relative to the
    /// viewport (getBoundingClientRect). WebKit paints the rect afresh at the requested size,
    /// so glass, blend modes, filters and gradients come out as on screen. Replies with a
    /// data: URL. op 'info' answers { scale } so the page can tell the bridge is there.
    func capture(_ raw: Any, _ reply: @escaping (Any?, String?) -> Void) {
        guard let body = raw as? [String: Any], let op = body["op"] as? String else { reply(nil, "bad request"); return }
        if op == "info" { reply(["scale": Double(window.backingScaleFactor), "zoom": Double(zoom)], nil); return }
        guard op == "snapshot", let r = body["rect"] as? [Double], r.count == 4, r[2] >= 1, r[3] >= 1 else {
            reply(nil, "bad request"); return
        }
        // CSS px -> view points (View > Zoom changes the page zoom).
        let rect = CGRect(x: r[0] * Double(zoom), y: r[1] * Double(zoom), width: r[2] * Double(zoom), height: r[3] * Double(zoom))
        let pixelWidth = max(1, min(8192, (body["pixelWidth"] as? Double) ?? r[2] * 2))
        let pixelHeight = min(16384, max(1, (pixelWidth * r[3] / r[2]).rounded()))   // Int() of a huge Double would trap
        let jpeg = (body["format"] as? String) == "jpeg"
        let quality = (body["quality"] as? Double) ?? 0.92
        let config = WKSnapshotConfiguration()
        config.rect = rect
        // snapshotWidth is in points; the image comes back at the screen's scale.
        config.snapshotWidth = NSNumber(value: pixelWidth / Double(window.backingScaleFactor))
        config.afterScreenUpdates = true
        webView.takeSnapshot(with: config) { image, error in
            guard let image = image,
                  let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
                reply(nil, "snapshot failed: \(error?.localizedDescription ?? "no image")"); return
            }
            // Exact output size whatever the screen scale was, in sRGB like the web exports.
            let W = Int(pixelWidth), H = Int(pixelHeight)
            guard let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0,
                                      space: CGColorSpace(name: CGColorSpace.sRGB)!,
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
                reply(nil, "bitmap failed"); return
            }
            ctx.interpolationQuality = .high
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
            guard let flat = ctx.makeImage() else { reply(nil, "bitmap failed"); return }
            let out = NSBitmapImageRep(cgImage: flat)
            let data = jpeg
                ? out.representation(using: .jpeg, properties: [.compressionFactor: quality])
                : out.representation(using: .png, properties: [:])
            guard let data = data else { reply(nil, "encode failed"); return }
            reply("data:image/\(jpeg ? "jpeg" : "png");base64," + data.base64EncodedString(), nil)
        }
    }

    // Quit: give the page a moment to write any pending draft before exiting.
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        guard webView != nil else { return .terminateNow }
        var answered = false
        let finish = {
            if !answered { answered = true; NSApp.reply(toApplicationShouldTerminate: true) }
        }
        webView.callAsyncJavaScript("if (window.__flush) { await window.__flush(); } return true;",
                                    arguments: [:], in: nil, in: .page) { _ in finish() }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { finish() }
        return .terminateLater
    }

    // File menu items call into the page.
    @objc func menuCommand(_ sender: NSMenuItem) {
        guard let cmd = sender.representedObject as? String else { return }
        window.makeKeyAndOrderFront(nil)
        webView.evaluateJavaScript("window.BD && window.BD.menu('\(cmd)')")
    }

    // MARK: JS dialogs & file picker

    func sheetOrModal(_ alert: NSAlert, _ done: @escaping (NSApplication.ModalResponse) -> Void) {
        if window.isVisible { alert.beginSheetModal(for: window, completionHandler: done) }
        else { done(alert.runModal()) }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "OK")
        sheetOrModal(alert) { _ in completionHandler() }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        #if TESTHOOK
        if let answer = ProcessInfo.processInfo.environment["BD_HOOK_CONFIRM"] {
            completionHandler(answer == "1"); return
        }
        #endif
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Cancel")
        sheetOrModal(alert) { completionHandler($0 == .alertFirstButtonReturn) }
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let alert = NSAlert()
        alert.messageText = prompt
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Cancel")
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 260, height: 24))
        field.stringValue = defaultText ?? ""
        alert.accessoryView = field
        sheetOrModal(alert) { completionHandler($0 == .alertFirstButtonReturn ? field.stringValue : nil) }
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        #if TESTHOOK
        if let path = ProcessInfo.processInfo.environment["BD_HOOK_OPEN"] {
            completionHandler([URL(fileURLWithPath: path)]); return
        }
        #endif
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = parameters.allowsDirectories
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.allowedContentTypes = [.image]
        panel.message = "Choose a logo image"
        if window.isVisible {
            panel.beginSheetModal(for: window) { completionHandler($0 == .OK ? panel.urls : nil) }
        } else {
            completionHandler(panel.runModal() == .OK ? panel.urls : nil)
        }
    }

    // MARK: test hook (compiled only into TESTHOOK builds, never the installed app)

    #if TESTHOOK
    var hookTimer: Timer?
    func startTestHook() {
        guard let dir = ProcessInfo.processInfo.environment["BD_HOOK_DIR"] else { return }
        let cmd = URL(fileURLWithPath: dir).appendingPathComponent("cmd.js")
        let out = URL(fileURLWithPath: dir).appendingPathComponent("result.txt")
        let infoReq = URL(fileURLWithPath: dir).appendingPathComponent("info.req")
        let snapReq = URL(fileURLWithPath: dir).appendingPathComponent("snap.req")
        let menuReq = URL(fileURLWithPath: dir).appendingPathComponent("menu.req")
        let aboutReq = URL(fileURLWithPath: dir).appendingPathComponent("about.req")
        hookTimer = Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { [weak self] _ in
            if let self = self, (try? String(contentsOf: infoReq, encoding: .utf8)) != nil {
                try? FileManager.default.removeItem(at: infoReq)
                let w = self.window!
                func f(_ t: NSWindow.ButtonType) -> String {
                    guard let b = w.standardWindowButton(t) else { return "none" }
                    let r = b.convert(b.bounds, to: nil)   // window coords, origin bottom-left
                    return "x=\(Int(r.minX))..\(Int(r.maxX)) yFromTop=\(Int(w.frame.height - r.maxY))..\(Int(w.frame.height - r.minY)) hidden=\(b.isHidden)"
                }
                let info = """
                styleMask.fullSizeContentView=\(w.styleMask.contains(.fullSizeContentView))
                titlebarAppearsTransparent=\(w.titlebarAppearsTransparent) titleVisibility=\(w.titleVisibility.rawValue)
                contentLayoutRect.height=\(Int(w.contentLayoutRect.height)) frame.height=\(Int(w.frame.height))
                close: \(f(.closeButton))
                zoom: \(f(.zoomButton))
                dragStrip frame=\(self.dragStrip.frame) hidden=\(self.dragStrip.isHidden)
                webView frame=\(self.webView.frame)
                """
                try? info.write(to: URL(fileURLWithPath: dir).appendingPathComponent("info.txt"), atomically: true, encoding: .utf8)
            }
            if let self = self, let cmd = try? String(contentsOf: menuReq, encoding: .utf8) {
                try? FileManager.default.removeItem(at: menuReq)
                let item = NSMenuItem()
                item.representedObject = cmd.trimmingCharacters(in: .whitespacesAndNewlines)
                self.menuCommand(item)   // same path a File menu click takes
            }
            // about.req holds a PNG path: open About and save a picture of its panel.
            if let self = self, let path = try? String(contentsOf: aboutReq, encoding: .utf8) {
                try? FileManager.default.removeItem(at: aboutReq)
                self.showAbout()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                    guard let panel = NSApp.windows.first(where: { $0 !== self.window && $0.isVisible }),
                          let view = panel.contentView?.superview ?? panel.contentView,
                          let rep = view.bitmapImageRepForCachingDisplay(in: view.bounds) else { return }
                    view.cacheDisplay(in: view.bounds, to: rep)
                    try? rep.representation(using: .png, properties: [:])?
                        .write(to: URL(fileURLWithPath: path.trimmingCharacters(in: .whitespacesAndNewlines)))
                }
            }
            if let self = self, let path = try? String(contentsOf: snapReq, encoding: .utf8) {
                try? FileManager.default.removeItem(at: snapReq)
                self.webView.takeSnapshot(with: nil) { image, _ in
                    guard let tiff = image?.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                          let png = rep.representation(using: .png, properties: [:]) else { return }
                    try? png.write(to: URL(fileURLWithPath: path.trimmingCharacters(in: .whitespacesAndNewlines)))
                }
            }
            guard let self = self, let js = try? String(contentsOf: cmd, encoding: .utf8) else { return }
            try? FileManager.default.removeItem(at: cmd)
            self.webView.callAsyncJavaScript(js, arguments: [:], in: nil, in: .page) { result in
                switch result {
                case .success(let v): try? "\(v)".write(to: out, atomically: true, encoding: .utf8)
                case .failure(let e): try? "ERROR: \(e.localizedDescription)".write(to: out, atomically: true, encoding: .utf8)
                }
            }
        }
    }
    #endif
}

// MARK: - main

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
