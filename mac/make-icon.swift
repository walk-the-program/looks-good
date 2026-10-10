// Draws the app icon (warm paper tile, serif "Aa", three brand swatches) and
// writes a 1024px PNG. Usage: swift make-icon.swift out.png
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

// macOS icon grid: 824px tile centred on the 1024 canvas.
let tile = NSRect(x: 100, y: 100, width: 824, height: 824)
let tilePath = NSBezierPath(roundedRect: tile, xRadius: 185, yRadius: 185)

ctx.saveGState()
let shadow = NSShadow()
shadow.shadowColor = NSColor.black.withAlphaComponent(0.28)
shadow.shadowOffset = NSSize(width: 0, height: -14)
shadow.shadowBlurRadius = 28
shadow.set()
color(0xF4F1EA).setFill()
tilePath.fill()
ctx.restoreGState()

// Soft top-to-bottom warm gradient inside the tile.
ctx.saveGState()
tilePath.addClip()
NSGradient(colors: [color(0xFBF9F4), color(0xEDE8DD)])!.draw(in: tile, angle: -90)
ctx.restoreGState()

// Hairline edge.
color(0x000000, 0.08).setStroke()
tilePath.lineWidth = 3
tilePath.stroke()

// "Aa" in a serif face, ink colour.
let font = NSFont(name: "Georgia-Bold", size: 430) ?? NSFont.systemFont(ofSize: 430, weight: .bold)
let para = NSMutableParagraphStyle(); para.alignment = .center
let attrs: [NSAttributedString.Key: Any] = [
    .font: font, .foregroundColor: color(0x1B1A18), .paragraphStyle: para, .kern: -8,
]
let text = NSAttributedString(string: "Aa", attributes: attrs)
let ts = text.size()
text.draw(in: NSRect(x: tile.minX, y: tile.midY - ts.height / 2 + 70, width: tile.width, height: ts.height))

// Three swatches beneath.
let swatches: [UInt32] = [0xC8553D, 0xE0A63A, 0x3F6B5C]
let d: CGFloat = 92, gap: CGFloat = 34
let total = d * 3 + gap * 2
var x = tile.midX - total / 2
for c in swatches {
    let r = NSRect(x: x, y: tile.minY + 128, width: d, height: d)
    color(c).setFill()
    NSBezierPath(ovalIn: r).fill()
    x += d + gap
}

NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
