// dev/font-credits.swift - writes fonts/CREDITS.txt (family, licence, copyright line) for the
// fonts vendored by dev/vendor-fonts.py. Run after it:   swift dev/font-credits.swift
// Copyright comes from each file's own name table. Google strips the licence record from
// web files, so the licence is read from the copyright line when it says, else from
// APACHE (the Google Fonts families in this app published under Apache 2.0), else OFL.
import CoreText
import Foundation

let APACHE: Set<String> = ["Arimo", "Tinos", "Roboto Slab", "Permanent Marker", "Special Elite",
                           "Yellowtail", "Syncopate"]
let root = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().deletingLastPathComponent()
let css = try! String(contentsOf: root.appendingPathComponent("fonts/fonts.css"), encoding: .utf8)
// family -> first file, in fonts.css order
var firstFile: [String: String] = [:]
let rx = try! NSRegularExpression(pattern: "font-family: '([^']+)';[\\s\\S]*?url\\(files/([^)]+)\\)")
for m in rx.matches(in: css, range: NSRange(css.startIndex..., in: css)) {
    let fam = String(css[Range(m.range(at: 1), in: css)!]), file = String(css[Range(m.range(at: 2), in: css)!])
    if firstFile[fam] == nil { firstFile[fam] = file }
}
func copyright(_ file: String) -> String {
    guard let data = try? Data(contentsOf: root.appendingPathComponent("fonts/files/\(file)")),
          let d = (CTFontManagerCreateFontDescriptorsFromData(data as CFData) as? [CTFontDescriptor])?.first else { return "" }
    let s = (CTFontCopyName(CTFontCreateWithFontDescriptor(d, 12, nil), kCTFontCopyrightNameKey) as String?) ?? ""
    return s.replacingOccurrences(of: "\n", with: " ").trimmingCharacters(in: .whitespaces)
}
var out = """
Fonts bundled with Branding Designer
====================================
Copied unmodified from Google Fonts (fonts.google.com) by dev/vendor-fonts.py (latin subset).
Each font is free software under the licence named with it:
  SIL Open Font License 1.1  https://openfontlicense.org
  Apache License 2.0         https://www.apache.org/licenses/LICENSE-2.0


"""
var ofl = 0, apache = 0
for fam in firstFile.keys.sorted() {
    let c = copyright(firstFile[fam]!)
    let isApache = APACHE.contains(fam) || c.contains("Apache")
    if isApache { apache += 1 } else { ofl += 1 }
    var line = c.components(separatedBy: "This Font Software").first!.trimmingCharacters(in: .whitespaces)
    if line.isEmpty { line = "(no copyright line in the font file)" }
    out += "\(fam)\n  \(isApache ? "Apache License 2.0" : "SIL Open Font License 1.1")\n  \(line)\n\n"
}
try! out.write(to: root.appendingPathComponent("fonts/CREDITS.txt"), atomically: true, encoding: .utf8)
print("\(firstFile.count) families (\(ofl) OFL, \(apache) Apache) -> fonts/CREDITS.txt")
