Add-Type -AssemblyName System.Drawing

$size = 1024
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 10, 10, 12))

$accent = [System.Drawing.Color]::FromArgb(255, 125, 249, 255)
$pen = New-Object System.Drawing.Pen $accent, 10
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

function MakePoint([double]$x, [double]$y) {
    $scale = [double]$size / 80.0
    return New-Object System.Drawing.PointF ([single]($x * $scale)), ([single]($y * $scale))
}

$lines = @(
    @(40, 14, 14, 56),
    @(40, 14, 66, 56),
    @(14, 56, 66, 56),
    @(40, 40, 27, 32),
    @(40, 40, 53, 32),
    @(40, 40, 27, 50),
    @(40, 40, 53, 50)
)
foreach ($l in $lines) {
    $p1 = MakePoint $l[0] $l[1]
    $p2 = MakePoint $l[2] $l[3]
    $g.DrawLine($pen, $p1, $p2)
}

$br = New-Object System.Drawing.SolidBrush $accent
$circles = @(
    @(40, 14, 5), @(14, 56, 5), @(66, 56, 5), @(40, 40, 5),
    @(27, 32, 4), @(53, 32, 4), @(27, 50, 4), @(53, 50, 4)
)
$scale = [double]$size / 80.0
foreach ($c in $circles) {
    $cx = [double]$c[0] * $scale
    $cy = [double]$c[1] * $scale
    $r = [double]$c[2] * $scale
    $g.FillEllipse($br, [single]($cx - $r), [single]($cy - $r), [single]($r * 2), [single]($r * 2))
}

$dir = "C:\Users\Hasnain\Documents\tauri projects\lattice\src-tauri\icons"
$bmp.Save("$dir\source.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Resized PNGs Tauri expects
$sizes = @(32, 128, 256)
foreach ($s in $sizes) {
    $r = New-Object System.Drawing.Bitmap $s, $s
    $rg = [System.Drawing.Graphics]::FromImage($r)
    $rg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rg.DrawImage($bmp, 0, 0, $s, $s)
    if ($s -eq 256) {
        $r.Save("$dir\128x128@2x.png", [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
        $r.Save("$dir\${s}x${s}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $rg.Dispose(); $r.Dispose()
}

# Save a "Square*" set for Windows Store / Tauri compatibility
$squareSizes = @{
    "Square30x30Logo.png"      = 30
    "Square44x44Logo.png"      = 44
    "Square71x71Logo.png"      = 71
    "Square89x89Logo.png"      = 89
    "Square107x107Logo.png"    = 107
    "Square142x142Logo.png"    = 142
    "Square150x150Logo.png"    = 150
    "Square284x284Logo.png"    = 284
    "Square310x310Logo.png"    = 310
    "StoreLogo.png"            = 50
}
foreach ($name in $squareSizes.Keys) {
    $s = $squareSizes[$name]
    $r = New-Object System.Drawing.Bitmap $s, $s
    $rg = [System.Drawing.Graphics]::FromImage($r)
    $rg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rg.DrawImage($bmp, 0, 0, $s, $s)
    $r.Save("$dir\$name", [System.Drawing.Imaging.ImageFormat]::Png)
    $rg.Dispose(); $r.Dispose()
}

$g.Dispose(); $bmp.Dispose()
Write-Output "PNGs written to $dir"

# Build a multi-resolution ICO from PNG bitmaps using raw ICO format.
$icoSizes = @(16, 32, 48, 64, 128, 256)
$pngBytes = @()
foreach ($s in $icoSizes) {
    $r = New-Object System.Drawing.Bitmap $s, $s
    $rg = [System.Drawing.Graphics]::FromImage($r)
    $rg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rg.DrawImage($bmp, 0, 0, $s, $s)
    $ms = New-Object System.IO.MemoryStream
    $r.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytes += , $ms.ToArray()
    $rg.Dispose(); $r.Dispose(); $ms.Dispose()
}

$icoStream = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $icoStream
$bw.Write([UInt16]0)       # Reserved
$bw.Write([UInt16]1)       # Type 1 = ICO
$bw.Write([UInt16]$icoSizes.Count)
$headerSize = 6 + (16 * $icoSizes.Count)
$offset = $headerSize
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $s = $icoSizes[$i]
    $dataLen = $pngBytes[$i].Length
    $byteSize = if ($s -ge 256) { 0 } else { $s }
    $bw.Write([byte]$byteSize)   # width
    $bw.Write([byte]$byteSize)   # height
    $bw.Write([byte]0)           # palette
    $bw.Write([byte]0)           # reserved
    $bw.Write([UInt16]1)         # color planes
    $bw.Write([UInt16]32)        # bpp
    $bw.Write([UInt32]$dataLen)  # data size
    $bw.Write([UInt32]$offset)   # data offset
    $offset += $dataLen
}
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $bw.Write($pngBytes[$i])
}
$bw.Flush()
[System.IO.File]::WriteAllBytes("$dir\icon.ico", $icoStream.ToArray())
$bw.Close(); $icoStream.Dispose()

Write-Output "icon.ico written"
