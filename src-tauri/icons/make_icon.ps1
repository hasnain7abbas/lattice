Add-Type -AssemblyName System.Drawing

$size = 1024
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 10, 10, 12))

# Scale: SVG viewBox is 128 -> we render at $size
$scale = [double]$size / 128.0
function P([double]$x, [double]$y) { return New-Object System.Drawing.PointF ([single]($x * $scale)), ([single]($y * $scale)) }
function C([double]$x, [double]$y) { return @([single]($x * $scale), [single]($y * $scale)) }

$accent = [System.Drawing.Color]::FromArgb(255, 29, 147, 171)        # #1d93ab
$accentDim = [System.Drawing.Color]::FromArgb(140, 29, 147, 171)
$accentMid = [System.Drawing.Color]::FromArgb(215, 29, 147, 171)
$atomLight = [System.Drawing.Color]::FromArgb(255, 181, 251, 255)
$atomDark = [System.Drawing.Color]::FromArgb(255, 13, 86, 99)

# Corner coordinates (from the SVG). Avoid $G (collides with $g case-insensitively).
$cA = @(24,78); $cB = @(84,78); $cC = @(84,18); $cD = @(24,18)         # back face
$cE = @(44,110); $cF = @(104,110); $cGf = @(104,50); $cH = @(44,50)    # front face

function DrawLine($a, $b, [System.Drawing.Color]$color, [double]$w) {
    $pen = New-Object System.Drawing.Pen $color, ([single]($w * $scale))
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($pen, (P $a[0] $a[1]), (P $b[0] $b[1]))
    $pen.Dispose()
}

# Back edges (dimmer)
DrawLine $cA $cB $accentDim 2.5
DrawLine $cB $cC $accentDim 2.5
DrawLine $cC $cD $accentDim 2.5
DrawLine $cD $cA $accentDim 2.5

# Depth edges
DrawLine $cA $cE $accentMid 2.8
DrawLine $cB $cF $accentMid 2.8
DrawLine $cC $cGf $accentMid 2.8
DrawLine $cD $cH $accentMid 2.8

# Front edges (brightest)
DrawLine $cE $cF $accent 3.0
DrawLine $cF $cGf $accent 3.0
DrawLine $cGf $cH $accent 3.0
DrawLine $cH $cE $accent 3.0

function DrawAtom($p, [double]$r, [int]$alpha) {
    $cx = [double]$p[0] * $scale
    $cy = [double]$p[1] * $scale
    $rad = [double]$r * $scale
    $rect = New-Object System.Drawing.RectangleF ([single]($cx - $rad)), ([single]($cy - $rad)), ([single]($rad * 2)), ([single]($rad * 2))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse($rect)
    $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
    $brush.CenterPoint = New-Object System.Drawing.PointF ([single]($cx - $rad * 0.3)), ([single]($cy - $rad * 0.3))
    $brush.CenterColor = [System.Drawing.Color]::FromArgb($alpha, $atomLight.R, $atomLight.G, $atomLight.B)
    $brush.SurroundColors = @([System.Drawing.Color]::FromArgb($alpha, $atomDark.R, $atomDark.G, $atomDark.B))
    $g.FillEllipse($brush, $rect)
    $brush.Dispose(); $path.Dispose()
}

# Back atoms (slightly transparent, smaller)
DrawAtom $cA 7 215
DrawAtom $cB 7 215
DrawAtom $cC 7 215
DrawAtom $cD 7 215

# Front atoms (full opacity, larger)
DrawAtom $cE 8.5 255
DrawAtom $cF 8.5 255
DrawAtom $cGf 8.5 255
DrawAtom $cH 8.5 255

$dir = "C:\Users\Hasnain\Documents\tauri projects\lattice\src-tauri\icons"
$bmp.Save("$dir\source.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "Wrote $dir\source.png"
