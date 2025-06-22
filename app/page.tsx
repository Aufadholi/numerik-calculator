"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Play,
  RotateCcw,
  Info,
  Delete,
  X,
} from "lucide-react"

// Function to safely evaluate mathematical expressions
function evaluateFunction(x: number, functionStr: string): number {
  try {
    // Replace common mathematical notation
    const sanitized = functionStr
      .replace(/\^/g, "**")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/log/g, "Math.log")
      .replace(/ln/g, "Math.log")
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/pi/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/x/g, x.toString())

    return eval(sanitized)
  } catch (error) {
    throw new Error("Invalid function expression")
  }
}

// Trapezoid Rule implementation
function trapezoidRule(functionStr: string, a: number, b: number, n: number): number {
  const h = (b - a) / n
  let total = 0.5 * (evaluateFunction(a, functionStr) + evaluateFunction(b, functionStr))

  for (let i = 1; i < n; i++) {
    total += evaluateFunction(a + i * h, functionStr)
  }

  return total * h
}

// Simpson's 1/3 Rule implementation
function simpsonRule(functionStr: string, a: number, b: number, n: number): number {
  // Ensure n is even for Simpson's rule
  if (n % 2 === 1) {
    n += 1
  }

  const h = (b - a) / n
  let total = evaluateFunction(a, functionStr) + evaluateFunction(b, functionStr)

  for (let i = 1; i < n; i++) {
    const k = a + i * h
    total += (i % 2 === 1 ? 4 : 2) * evaluateFunction(k, functionStr)
  }

  return (total * h) / 3
}

export default function IntegralCalculator() {
  const [functionInput, setFunctionInput] = useState("x**2 + 3*x")
  const [lowerBound, setLowerBound] = useState("0")
  const [upperBound, setUpperBound] = useState("2")
  const [segments, setSegments] = useState("1000")
  const [method, setMethod] = useState("trapezoid")
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

  const calculateIntegral = async () => {
    setIsCalculating(true)
    setError(null)
    setResult(null)

    try {
      const a = Number.parseFloat(lowerBound)
      const b = Number.parseFloat(upperBound)
      const n = Number.parseInt(segments)

      if (isNaN(a) || isNaN(b) || isNaN(n)) {
        throw new Error("Mohon masukkan angka yang valid untuk batas dan segmen")
      }

      if (a >= b) {
        throw new Error("Batas bawah harus lebih kecil dari batas atas")
      }

      if (n <= 0) {
        throw new Error("Jumlah segmen harus positif")
      }

      // Test the function with a sample value
      evaluateFunction(a, functionInput)

      let calculatedResult: number

      if (method === "trapezoid") {
        calculatedResult = trapezoidRule(functionInput, a, b, n)
      } else {
        calculatedResult = simpsonRule(functionInput, a, b, n)
      }

      setResult(calculatedResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menghitung")
    } finally {
      setIsCalculating(false)
    }
  }

  const resetForm = () => {
    setFunctionInput("x**2 + 3*x")
    setLowerBound("0")
    setUpperBound("2")
    setSegments("1000")
    setMethod("trapezoid")
    setResult(null)
    setError(null)
  }

  const insertAtCursor = (text: string) => {
    const input = document.getElementById("function") as HTMLInputElement
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const newValue = functionInput.slice(0, start) + text + functionInput.slice(end)
      setFunctionInput(newValue)

      // Set cursor position after insertion
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    }
  }

  const clearFunction = () => {
    setFunctionInput("")
    const input = document.getElementById("function") as HTMLInputElement
    if (input) input.focus()
  }

  const backspace = () => {
    const input = document.getElementById("function") as HTMLInputElement
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0

      if (start === end && start > 0) {
        // Delete single character
        const newValue = functionInput.slice(0, start - 1) + functionInput.slice(start)
        setFunctionInput(newValue)
        setTimeout(() => {
          input.focus()
          input.setSelectionRange(start - 1, start - 1)
        }, 0)
      } else if (start !== end) {
        // Delete selection
        const newValue = functionInput.slice(0, start) + functionInput.slice(end)
        setFunctionInput(newValue)
        setTimeout(() => {
          input.focus()
          input.setSelectionRange(start, start)
        }, 0)
      }
    }
  }

  const mathButtons = [
    // Variables and constants
    { label: "x", value: "x", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    { label: "π", value: "Math.PI", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
    { label: "e", value: "Math.E", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },

    // Basic operations
    { label: "+", value: " + ", color: "bg-green-100 text-green-800 hover:bg-green-200" },
    { label: "−", value: " - ", color: "bg-green-100 text-green-800 hover:bg-green-200" },
    { label: "×", value: " * ", color: "bg-green-100 text-green-800 hover:bg-green-200" },
    { label: "÷", value: " / ", color: "bg-green-100 text-green-800 hover:bg-green-200" },

    // Powers
    { label: "x²", value: "x**2", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
    { label: "x³", value: "x**3", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
    { label: "x^n", value: "x**", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
    { label: "^", value: "**", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },

    // Functions
    { label: "sin", value: "Math.sin(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
    { label: "cos", value: "Math.cos(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
    { label: "tan", value: "Math.tan(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
    { label: "ln", value: "Math.log(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
    { label: "√", value: "Math.sqrt(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
    { label: "exp", value: "Math.exp(", color: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },

    // Parentheses
    { label: "(", value: "(", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    { label: ")", value: ")", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  ]

  const examples = [
    { label: "Kuadrat", value: "x**2 + 3*x", icon: "📈", color: "bg-blue-100 text-blue-800" },
    { label: "Sinus", value: "Math.sin(x)", icon: "🌊", color: "bg-purple-100 text-purple-800" },
    { label: "Eksponensial", value: "Math.exp(x)", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
    { label: "Polinomial", value: "x**3 - 2*x**2 + x - 1", icon: "🔢", color: "bg-green-100 text-green-800" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kalkulator Integral
              </h1>
              <p className="text-sm text-gray-600">Hitung integral tentu dengan mudah dan akurat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Selamat Datang! 👋</h2>
                <p className="text-blue-100">
                  Gunakan tombol matematika di bawah untuk membangun fungsi Anda dengan mudah, atau ketik langsung.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-gray-800">Parameter Input</CardTitle>
                </div>
                <CardDescription>Masukkan fungsi dan batas integrasi Anda</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Function Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="function" className="text-sm font-semibold text-gray-700">
                      Fungsi f(x)
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Wajib diisi
                    </Badge>
                  </div>

                  {/* Function Input Field */}
                  <div className="relative">
                    <Input
                      id="function"
                      value={functionInput}
                      onChange={(e) => setFunctionInput(e.target.value)}
                      placeholder="Contoh: x**2 + 3*x"
                      className="font-mono text-lg p-3 border-2 focus:border-blue-500 transition-colors pr-12"
                    />
                    <Button
                      onClick={clearFunction}
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-red-100"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Mathematical Keyboard */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">Keyboard Matematika</span>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {mathButtons.map((btn, index) => (
                        <Button
                          key={index}
                          onClick={() => insertAtCursor(btn.value)}
                          variant="outline"
                          size="sm"
                          className={`h-10 text-sm font-semibold border-0 ${btn.color} transition-all hover:scale-105`}
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={backspace}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 border-0"
                      >
                        <Delete className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                      <Button
                        onClick={clearFunction}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 border-0"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Bersihkan
                      </Button>
                    </div>
                  </div>

                  {/* Example Functions */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Contoh fungsi populer:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {examples.map((example) => (
                        <Button
                          key={example.label}
                          variant="outline"
                          size="sm"
                          onClick={() => setFunctionInput(example.value)}
                          className={`justify-start text-left h-auto p-3 ${example.color} border-0 hover:scale-105 transition-transform`}
                        >
                          <span className="text-lg mr-2">{example.icon}</span>
                          <div>
                            <div className="font-semibold">{example.label}</div>
                            <div className="text-xs opacity-75 font-mono">{example.value}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bounds */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lower" className="text-sm font-semibold text-gray-700">
                      Batas Bawah (a)
                    </Label>
                    <Input
                      id="lower"
                      type="number"
                      value={lowerBound}
                      onChange={(e) => setLowerBound(e.target.value)}
                      step="any"
                      className="text-lg p-3 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upper" className="text-sm font-semibold text-gray-700">
                      Batas Atas (b)
                    </Label>
                    <Input
                      id="upper"
                      type="number"
                      value={upperBound}
                      onChange={(e) => setUpperBound(e.target.value)}
                      step="any"
                      className="text-lg p-3 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Segments and Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="segments" className="text-sm font-semibold text-gray-700">
                      Jumlah Segmen
                    </Label>
                    <Input
                      id="segments"
                      type="number"
                      value={segments}
                      onChange={(e) => setSegments(e.target.value)}
                      min="1"
                      className="text-lg p-3 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-sm font-semibold text-gray-700">
                      Metode Integrasi
                    </Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="text-lg p-3 border-2 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trapezoid">
                          <div className="flex items-center gap-2">
                            <span>📊</span>
                            Aturan Trapezoid
                          </div>
                        </SelectItem>
                        <SelectItem value="simpson">
                          <div className="flex items-center gap-2">
                            <span>📈</span>
                            Aturan Simpson 1/3
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={calculateIntegral}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Menghitung...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Hitung Integral
                      </>
                    )}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="px-6 border-2 hover:bg-gray-50">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results and Info */}
          <div className="space-y-6">
            {/* Results */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-gray-800">Hasil Perhitungan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {result !== null && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-800 mb-1">{result.toFixed(6)}</div>
                            <Badge className="bg-green-100 text-green-800">Hasil Integral</Badge>
                          </div>

                          <Separator />

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Metode:</span>
                              <span className="font-semibold">
                                {method === "trapezoid" ? "Trapezoid" : "Simpson 1/3"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fungsi:</span>
                              <span className="font-mono text-xs">{functionInput}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Batas:</span>
                              <span>
                                [{lowerBound}, {upperBound}]
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Segmen:</span>
                              <span>{segments}</span>
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {!result && !error && (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Masukkan parameter dan klik "Hitung Integral" untuk melihat hasil</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Method Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-gray-800">Info Metode</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {method === "trapezoid" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      <h3 className="font-semibold text-purple-800">Aturan Trapezoid</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Memperkirakan integral dengan membagi area di bawah kurva menjadi trapezoid-trapezoid. Metode ini
                      sederhana dan cukup akurat untuk fungsi yang tidak terlalu kompleks.
                    </p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Akurasi: Baik
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📈</span>
                      <h3 className="font-semibold text-purple-800">Aturan Simpson 1/3</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Menggunakan kurva parabola untuk memperkirakan area, memberikan hasil yang lebih akurat
                      dibandingkan metode trapezoid, terutama untuk fungsi yang halus.
                    </p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Akurasi: Sangat Baik
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Syntax Help */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-gray-800">Tips Penggunaan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">🎯 Cara Mudah Input Pangkat:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800">x²</Badge>
                        <span className="text-gray-600">untuk x pangkat 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800">x³</Badge>
                        <span className="text-gray-600">untuk x pangkat 3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800">x^n</Badge>
                        <span className="text-gray-600">lalu ketik angka pangkat</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">📚 Fungsi Lainnya:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-100 text-cyan-800">sin, cos, tan</Badge>
                        <span className="text-gray-600">trigonometri</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-100 text-cyan-800">ln, exp</Badge>
                        <span className="text-gray-600">logaritma & eksponensial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">π, e</Badge>
                        <span className="text-gray-600">konstanta matematika</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
