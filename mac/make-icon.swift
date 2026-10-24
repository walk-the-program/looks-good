// Draws the app icon and writes a 1024px PNG. Usage: swift make-icon.swift out.png
// The "Crop, on the frost" mark: ink crop brackets around a coral dot, printed crisply on a
// frosted white tile (lilac and coral glows blurred to light, a white veil, fine grain, a top
// sheen and a bright rim). Same recipe as favicon.svg and mac/icon-layers/. The grain is seeded
// noise, so every build produces the same pixels.
import AppKit
import CoreImage

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "icon.png"
let size = 1024
let T = 824                      // macOS icon grid: 824px tile centred on the 1024 canvas
let k = CGFloat(T) / 100         // 100-unit design canvas -> tile pixels (8.24)

func color(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: a)
}
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
func makeContext(_ w: Int, _ h: Int) -> CGContext {
    CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
}
// Draw in the 100-unit design space with y pointing down, like the SVG.
func designSpace(_ c: CGContext, _ body: () -> Void) {
    c.saveGState(); c.translateBy(x: 0, y: CGFloat(T)); c.scaleBy(x: k, y: -k); body(); c.restoreGState()
}

// 1. Glows: two soft circles, Gaussian-blurred with sigma = 14% of the tile (CoreImage).
let glowCtx = makeContext(T, T)
designSpace(glowCtx) {
    glowCtx.setFillColor(color(0xB9ADDF, 0.95)); glowCtx.fillEllipse(in: CGRect(x: 18 - 38, y: 14 - 38, width: 76, height: 76))
    glowCtx.setFillColor(color(0xEE8F72, 0.70)); glowCtx.fillEllipse(in: CGRect(x: 86 - 34, y: 92 - 34, width: 68, height: 68))
}
let ci = CIContext(options: [.workingColorSpace: cs, .outputColorSpace: cs])
let blurred = CIImage(cgImage: glowCtx.makeImage()!)
    .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 0.14 * Double(T)])
    .cropped(to: CGRect(x: 0, y: 0, width: T, height: T))
let glowImage = ci.createCGImage(blurred, from: CGRect(x: 0, y: 0, width: T, height: T), format: .RGBA8, colorSpace: cs)!

// 2. Grain: seeded monochrome noise (xorshift), two octaves of 1px and 2px cells for a fine tooth.
let grainCtx = makeContext(T, T)
do {
    let px = grainCtx.data!.assumingMemoryBound(to: UInt8.self)
    let rb = grainCtx.bytesPerRow
    var state: UInt64 = 0x9E3779B97F4A7C15
    func rnd() -> Double {
        state ^= state << 13; state ^= state >> 7; state ^= state << 17
        return Double(state >> 11) / Double(1 << 53)
    }
    var coarse = [Double](repeating: 0, count: (T / 2 + 1) * (T / 2 + 1))
    for i in 0..<coarse.count { coarse[i] = rnd() }
    for y in 0..<T { for x in 0..<T {
        let g = 0.6 * rnd() + 0.4 * coarse[(y / 2) * (T / 2 + 1) + x / 2]
        let v = UInt8(max(0, min(255, g * 255)))
        let o = y * rb + x * 4
        px[o] = v; px[o + 1] = v; px[o + 2] = v; px[o + 3] = 255
    } }
}

// 3. Compose the tile.
let tileCtx = makeContext(T, T)
tileCtx.setFillColor(color(0xF3F1F7)); tileCtx.fill(CGRect(x: 0, y: 0, width: T, height: T))
tileCtx.draw(glowImage, in: CGRect(x: 0, y: 0, width: T, height: T))
tileCtx.setFillColor(color(0xFFFFFF, 0.25)); tileCtx.fill(CGRect(x: 0, y: 0, width: T, height: T))   // veil
tileCtx.saveGState()
tileCtx.setBlendMode(.multiply); tileCtx.setAlpha(0.09)
tileCtx.draw(grainCtx.makeImage()!, in: CGRect(x: 0, y: 0, width: T, height: T))
tileCtx.restoreGState()
// sheen: white 0.55 -> 0 from the top edge to 45% down
let sheen = CGGradient(colorsSpace: cs, colors: [color(0xFFFFFF, 0.55), color(0xFFFFFF, 0)] as CFArray, locations: [0, 1])!
tileCtx.drawLinearGradient(sheen, start: CGPoint(x: 0, y: CGFloat(T)), end: CGPoint(x: 0, y: CGFloat(T) * 0.55), options: [])
// the mark, crisp on top
let ink = color(0x1E1F21)
designSpace(tileCtx) {
    let p = CGMutablePath()
    func line(_ pts: [(CGFloat, CGFloat)]) {
        p.move(to: CGPoint(x: pts[0].0, y: pts[0].1))
        for q in pts.dropFirst() { p.addLine(to: CGPoint(x: q.0, y: q.1)) }
    }
    line([(24, 37), (24, 24), (37, 24)]); line([(63, 24), (76, 24), (76, 37)])
    line([(76, 63), (76, 76), (63, 76)]); line([(37, 76), (24, 76), (24, 63)])
    tileCtx.setStrokeColor(ink); tileCtx.setLineWidth(6.5); tileCtx.setLineCap(.round); tileCtx.setLineJoin(.round)
    tileCtx.addPath(p); tileCtx.strokePath()
    let dot = CGRect(x: 38, y: 38, width: 24, height: 24)
    tileCtx.setFillColor(color(0xEE8F72)); tileCtx.fillEllipse(in: dot)
    tileCtx.strokeEllipse(in: dot)
}
let tileImage = tileCtx.makeImage()!

// 4. Place on the 1024 canvas: drop shadow, clipped tile, rim.
let ctx = makeContext(size, size)
let tileRect = CGRect(x: 100, y: 100, width: T, height: T)
let tilePath = CGPath(roundedRect: tileRect, cornerWidth: 185, cornerHeight: 185, transform: nil)
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -14), blur: 28, color: color(0x000000, 0.3))
ctx.setFillColor(color(0xF3F1F7)); ctx.addPath(tilePath); ctx.fillPath()
ctx.restoreGState()
ctx.saveGState()
ctx.addPath(tilePath); ctx.clip()
ctx.draw(tileImage, in: tileRect)
// rim: bright inner top highlight, faint darker bottom edge
ctx.addPath(tilePath); ctx.clip()
let top = CGGradient(colorsSpace: cs, colors: [color(0xFFFFFF, 0.9), color(0xFFFFFF, 0)] as CFArray, locations: [0, 1])!
ctx.saveGState()
ctx.addPath(tilePath); ctx.addPath(CGPath(roundedRect: tileRect.insetBy(dx: 0, dy: 0).offsetBy(dx: 0, dy: -12), cornerWidth: 185, cornerHeight: 185, transform: nil))
ctx.clip(using: .evenOdd)
ctx.drawLinearGradient(top, start: CGPoint(x: 0, y: tileRect.maxY), end: CGPoint(x: 0, y: tileRect.maxY - 40), options: [])
ctx.restoreGState()
ctx.saveGState()
ctx.addPath(tilePath); ctx.addPath(CGPath(roundedRect: tileRect.offsetBy(dx: 0, dy: 8), cornerWidth: 185, cornerHeight: 185, transform: nil))
ctx.clip(using: .evenOdd)
ctx.setFillColor(color(0x281E3C, 0.18)); ctx.fill(tileRect)
ctx.restoreGState()
ctx.restoreGState()

let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
