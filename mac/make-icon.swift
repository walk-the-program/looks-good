// Draws the app icon and writes a 1024px PNG. Usage: swift make-icon.swift out.png
// The "Crop, Sage" mark: ink crop brackets around a white dot on a flat sage ground (#b8c8a6).
// No frost, glow, grain, sheen or rim. The 824px tile on the 1024 canvas is a continuous
// superellipse (n = 5, Apple-style) with a two-layer drop shadow and a hairline inner edge
// (white 18% at the top, black 8% at the bottom), the same tile as the other Nominal Studios icons.
import AppKit

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "icon.png"
let size = 1024
let T = 824                      // macOS icon grid: 824px tile centred on the 1024 canvas
let k = CGFloat(T) / 100         // 100-unit design canvas -> tile pixels (8.24)

func color(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: a)
}
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!

// Squircle: |x|^5 + |y|^5 = 1, 720 sampled points, 412px half-width, centred on the canvas.
func squircle() -> CGPath {
    let p = CGMutablePath(); let n = 720, half = CGFloat(T) / 2, c = CGFloat(size) / 2
    for i in 0..<n {
        let t = Double(i) / Double(n) * 2 * Double.pi
        let cx = cos(t), sy = sin(t)
        let x = c + half * CGFloat((cx < 0 ? -1.0 : 1.0) * pow(abs(cx), 2.0 / 5.0))
        let y = c + half * CGFloat((sy < 0 ? -1.0 : 1.0) * pow(abs(sy), 2.0 / 5.0))
        if i == 0 { p.move(to: CGPoint(x: x, y: y)) } else { p.addLine(to: CGPoint(x: x, y: y)) }
    }
    p.closeSubpath(); return p
}
let tilePath = squircle()
let sage: UInt32 = 0xB8C8A6

// 1. Two-layer drop shadow (CG y points up, so a downward shadow has a negative y offset).
for (dy, blur, alpha) in [(-18.0, 36.0, 0.18), (-4.0, 8.0, 0.12)] {
    ctx.saveGState()
    ctx.setShadow(offset: CGSize(width: 0, height: dy), blur: CGFloat(blur), color: color(0x000000, CGFloat(alpha)))
    ctx.setFillColor(color(sage)); ctx.addPath(tilePath); ctx.fillPath()
    ctx.restoreGState()
}

// 2. Flat ground and the mark, clipped to the tile.
ctx.saveGState()
ctx.addPath(tilePath); ctx.clip()
ctx.setFillColor(color(sage)); ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))
ctx.saveGState()
ctx.translateBy(x: 100, y: CGFloat(size) - 100); ctx.scaleBy(x: k, y: -k)   // 100-unit space, y down
let p = CGMutablePath()
func line(_ pts: [(CGFloat, CGFloat)]) {
    p.move(to: CGPoint(x: pts[0].0, y: pts[0].1))
    for q in pts.dropFirst() { p.addLine(to: CGPoint(x: q.0, y: q.1)) }
}
line([(24, 37), (24, 24), (37, 24)]); line([(63, 24), (76, 24), (76, 37)])
line([(76, 63), (76, 76), (63, 76)]); line([(37, 76), (24, 76), (24, 63)])
ctx.setStrokeColor(color(0x1E1F21)); ctx.setLineWidth(6.5); ctx.setLineCap(.round); ctx.setLineJoin(.round)
ctx.addPath(p); ctx.strokePath()
let dot = CGRect(x: 38, y: 38, width: 24, height: 24)
ctx.setFillColor(color(0xFFFFFF)); ctx.fillEllipse(in: dot)
ctx.strokeEllipse(in: dot)
ctx.restoreGState()

// 3. Hairline inner edge: a 3px stroke centred on the outline, clipped to the inside (1.5px visible).
ctx.addPath(tilePath); ctx.setLineWidth(3); ctx.replacePathWithStrokedPath(); ctx.clip()
let edge = CGGradient(colorsSpace: cs, colors: [color(0xFFFFFF, 0.18), color(0xFFFFFF, 0), color(0x000000, 0), color(0x000000, 0.08)] as CFArray,
                      locations: [0, 0.5, 0.5, 1])!
ctx.drawLinearGradient(edge, start: CGPoint(x: 0, y: CGFloat(size) - 100), end: CGPoint(x: 0, y: 100), options: [])
ctx.restoreGState()

let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
