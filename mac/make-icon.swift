// Draws the app icon and writes a 1024px PNG. Usage: swift make-icon.swift out.png
// A fan of three brand cards on an ink tile: the same brand in three design languages
// (a glowing gradient, a bold graphic print, and quiet paper with a serif "Aa" and swatches).
import AppKit

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "icon.png"
let size = 1024
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
                           samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
let ctx = NSGraphicsContext.current!.cgContext

func color(_ hex: UInt32, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: a)
}
func withState(_ body: () -> Void) { ctx.saveGState(); body(); ctx.restoreGState() }

// macOS icon grid: 824px tile centred on the 1024 canvas.
let tile = NSRect(x: 100, y: 100, width: 824, height: 824)
let tilePath = NSBezierPath(roundedRect: tile, xRadius: 185, yRadius: 185)

withState {
    let s = NSShadow()
    s.shadowColor = NSColor.black.withAlphaComponent(0.3)
    s.shadowOffset = NSSize(width: 0, height: -14)
    s.shadowBlurRadius = 28
    s.set()
    color(0x17151B).setFill()
    tilePath.fill()
}
withState {
    tilePath.addClip()
    NSGradient(colors: [color(0x2A2631), color(0x121016)])!.draw(in: tile, angle: -90)
    // a faint warm glow behind the fan
    NSGradient(colors: [color(0xFF8A4C, 0.22), color(0xFF8A4C, 0)])!
        .draw(fromCenter: NSPoint(x: 512, y: 600), radius: 0, toCenter: NSPoint(x: 512, y: 600), radius: 420, options: [])
}
color(0xFFFFFF, 0.07).setStroke()
tilePath.lineWidth = 3
tilePath.stroke()

// Cards pivot around a point below the tile, so they fan like a hand of cards.
let card = NSRect(x: -190, y: 0, width: 380, height: 510)   // in pivot space; y = distance above pivot
let pivot = NSPoint(x: 512, y: -40)
let lift: CGFloat = 252                                        // pivot -> card bottom
func drawCard(angle: CGFloat, dx: CGFloat, _ paint: (NSRect, NSBezierPath) -> Void) {
    withState {
        ctx.translateBy(x: pivot.x + dx, y: pivot.y)
        ctx.rotate(by: angle * .pi / 180)
        ctx.translateBy(x: 0, y: lift)
        let path = NSBezierPath(roundedRect: card, xRadius: 46, yRadius: 46)
        withState {
            let s = NSShadow()
            s.shadowColor = NSColor.black.withAlphaComponent(0.45)
            s.shadowOffset = NSSize(width: 0, height: -10)
            s.shadowBlurRadius = 36
            s.set()
            color(0x000000).setFill()
            path.fill()
        }
        withState { path.addClip(); paint(card, path) }
        color(0xFFFFFF, 0.14).setStroke()
        path.lineWidth = 2.5
        path.stroke()
    }
}

// Back left: a luminous gradient world.
drawCard(angle: 13, dx: -18) { r, _ in
    NSGradient(colors: [color(0x3B1F8F), color(0x8E3BD8), color(0xFF5FA2), color(0xFFB36B)])!.draw(in: r, angle: 62)
    NSGradient(colors: [color(0xFFFFFF, 0.55), color(0xFFFFFF, 0)])!
        .draw(fromCenter: NSPoint(x: r.minX + 120, y: r.maxY - 140), radius: 0,
              toCenter: NSPoint(x: r.minX + 120, y: r.maxY - 140), radius: 260, options: [])
}

// Back right: a bold graphic print, a red field with a halftone-dot grid and a black disc.
drawCard(angle: -12, dx: 18) { r, _ in
    color(0xE8452C).setFill(); r.fill()
    color(0x1A1214, 0.9).setFill()
    let step: CGFloat = 34
    var y = r.minY + 22
    var row = 0
    while y < r.maxY {
        var x = r.minX + 22 + (row % 2 == 0 ? 0 : step / 2)
        while x < r.maxX {
            let t = (y - r.minY) / r.height          // dots grow toward the top
            let d = 4 + 12 * t
            NSBezierPath(ovalIn: NSRect(x: x - d / 2, y: y - d / 2, width: d, height: d)).fill()
            x += step
        }
        y += step; row += 1
    }
    color(0xF6E7C9).setFill()
    NSBezierPath(ovalIn: NSRect(x: r.midX + 10, y: r.maxY - 220, width: 180, height: 180)).fill()
}

// Front: warm paper with a serif "Aa" and three swatches.
drawCard(angle: 0, dx: 0) { r, _ in
    NSGradient(colors: [color(0xFBF8F2), color(0xEDE6D8)])!.draw(in: r, angle: -90)
    let font = NSFont(name: "Georgia-Bold", size: 250) ?? NSFont.systemFont(ofSize: 250, weight: .bold)
    let para = NSMutableParagraphStyle(); para.alignment = .center
    let text = NSAttributedString(string: "Aa", attributes: [
        .font: font, .foregroundColor: color(0x1B1A18), .paragraphStyle: para, .kern: -6,
    ])
    let ts = text.size()
    text.draw(in: NSRect(x: r.minX, y: r.midY - ts.height / 2 + 60, width: r.width, height: ts.height))
    let swatches: [UInt32] = [0xE8452C, 0x8E3BD8, 0x1B1A18]
    let d: CGFloat = 64, gap: CGFloat = 22
    var x = r.midX - (d * 3 + gap * 2) / 2
    for c in swatches {
        color(c).setFill()
        NSBezierPath(ovalIn: NSRect(x: x, y: r.minY + 92, width: d, height: d)).fill()
        x += d + gap
    }
}

NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
