"use client"

import { useState, useRef, useEffect } from "react"
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
  Infinity,
  Minus,
  Plus,
} from "lucide-react"

// Component to render mathematical expressions with proper formatting
function MathDisplay({ expression }: { expression: string }) {
  const renderFormattedExpression = (expr: string) => {
    // More comprehensive regex to handle various mathematical patterns
    let formatted = expr
    
    // Replace functions first
    formatted = formatted.replace(/\bsqrt\(/g, '√(')
    formatted = formatted.replace(/\bcbrt\(/g, '∛(')
    formatted = formatted.replace(/\babs\(/g, '|')
    formatted = formatted.replace(/\bfloor\(/g, '⌊')
    formatted = formatted.replace(/\bceil\(/g, '⌈')
    formatted = formatted.replace(/\bpi\b/g, 'π')
    formatted = formatted.replace(/\be\b/g, 'e')
    formatted = formatted.replace(/\bInfinity\b/g, '∞')
    
    // Handle closing for special functions
    formatted = formatted.replace(/\|([^|]+)\|/g, '|$1|')
    
    // Split by various patterns including complex powers
    const parts = formatted.split(/(\^[\d\-]+|\^\([^)]+\)|[a-zA-Z]\^[\d\-]+|[a-zA-Z]\^\([^)]+\))/g)
    const result = []
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      
      if (!part) continue
      
      // Handle x^(expression) patterns - complex exponents
      if (/^([a-zA-Z])\^\(([^)]+)\)$/.test(part)) {
        const match = part.match(/^([a-zA-Z])\^\(([^)]+)\)$/)
        if (match) {
          result.push(
            <span key={i}>
              {match[1]}<sup className="text-xs">({match[2]})</sup>
            </span>
          )
        }
      }
      // Handle standalone ^(expression) patterns
      else if (/^\^\(([^)]+)\)$/.test(part)) {
        const match = part.match(/^\^\(([^)]+)\)$/)
        if (match) {
          result.push(<sup key={i} className="text-xs">({match[1]})</sup>)
        }
      }
      // Handle x^n patterns (simple numbers)
      else if (/^([a-zA-Z])\^([\d\-]+)$/.test(part)) {
        const match = part.match(/^([a-zA-Z])\^([\d\-]+)$/)
        if (match) {
          result.push(
            <span key={i}>
              {match[1]}<sup className="text-xs">{match[2]}</sup>
            </span>
          )
        }
      }
      // Handle standalone ^n patterns
      else if (/^\^([\d\-]+)$/.test(part)) {
        const match = part.match(/^\^([\d\-]+)$/)
        if (match) {
          result.push(<sup key={i} className="text-xs">{match[1]}</sup>)
        }
      }
      // Regular text - process for additional symbols and nested powers
      else {
        // Handle powers within the text - both simple and complex
        let processedPart = part
        
        // Process complex powers first: x^(expression)
        processedPart = processedPart.replace(/([a-zA-Z])(\^\([^)]+\))/g, (match, variable, powerExpr) => {
          const exponent = powerExpr.match(/\^\(([^)]+)\)/)[1]
          return `${variable}^(${exponent})`
        })
        
        // Process simple powers: x^n
        processedPart = processedPart.replace(/([a-zA-Z])(\^)([\d\-]+)/g, (match, variable, caret, exponent) => {
          return `${variable}^${exponent}`
        })
        
        if (processedPart !== part) {
          // If we found powers, we need to split and process them
          const subParts = processedPart.split(/([a-zA-Z]\^\([^)]+\)|[a-zA-Z]\^[\d\-]+)/g)
          for (let j = 0; j < subParts.length; j++) {
            const subPart = subParts[j]
            
            // Handle complex powers in subparts
            if (/^([a-zA-Z])\^\(([^)]+)\)$/.test(subPart)) {
              const match = subPart.match(/^([a-zA-Z])\^\(([^)]+)\)$/)
              if (match) {
                result.push(
                  <span key={`${i}-${j}`}>
                    {match[1]}<sup className="text-xs">({match[2]})</sup>
                  </span>
                )
              }
            }
            // Handle simple powers in subparts
            else if (/^([a-zA-Z])\^([\d\-]+)$/.test(subPart)) {
              const match = subPart.match(/^([a-zA-Z])\^([\d\-]+)$/)
              if (match) {
                result.push(
                  <span key={`${i}-${j}`}>
                    {match[1]}<sup className="text-xs">{match[2]}</sup>
                  </span>
                )
              }
            } else if (subPart) {
              result.push(<span key={`${i}-${j}`}>{subPart}</span>)
            }
          }
        } else {
          result.push(<span key={i}>{part}</span>)
        }
      }
    }
    
    return result.length > 0 ? result : [<span key="0">{expr}</span>]
  }

  return (
    <span className="font-mono">
      {renderFormattedExpression(expression)}
    </span>
  )
}

// Custom Math Input Component
function MathInput({ 
  value, 
  onChange, 
  placeholder, 
  className,
  id 
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleDisplayClick = () => {
    setIsEditing(true)
    setInputValue(value)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    onChange(inputValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onChange(inputValue)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {isEditing ? (
        <Input
          ref={inputRef}
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="font-mono text-lg p-3 bg-gray-800 border border-cyan-500/30 text-white focus:border-cyan-400 transition-colors pr-12"
        />
      ) : (
        <div
          ref={displayRef}
          onClick={handleDisplayClick}
          className="font-mono text-lg p-3 bg-gray-800 border border-cyan-500/30 rounded-md cursor-text min-h-[48px] flex items-center pr-12 hover:border-cyan-400/60 transition-colors"
        >
          {value ? (
            <div className="text-white"><MathDisplay expression={value} /></div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Function to parse and normalize mathematical expressions
// Function to parse and normalize mathematical expressions
function parseFunction(functionStr: string): string {
  let parsed = functionStr.toLowerCase()
  
  // Replace mathematical constants
  parsed = parsed.replace(/\bpi\b/g, "Math.PI")
  parsed = parsed.replace(/\be\b/g, "Math.E")
  parsed = parsed.replace(/\binfinity\b/g, "Infinity")
  
  // Replace trigonometric functions
  parsed = parsed.replace(/\bsin\b/g, "Math.sin")
  parsed = parsed.replace(/\bcos\b/g, "Math.cos")
  parsed = parsed.replace(/\btan\b/g, "Math.tan")
  parsed = parsed.replace(/\bsec\b/g, "(1/Math.cos")
  parsed = parsed.replace(/\bcsc\b/g, "(1/Math.sin")
  parsed = parsed.replace(/\bcot\b/g, "(1/Math.tan")
  
  // Replace inverse trigonometric functions
  parsed = parsed.replace(/\basin\b/g, "Math.asin")
  parsed = parsed.replace(/\bacos\b/g, "Math.acos")
  parsed = parsed.replace(/\batan\b/g, "Math.atan")
  
  // Replace hyperbolic functions
  parsed = parsed.replace(/\bsinh\b/g, "Math.sinh")
  parsed = parsed.replace(/\bcosh\b/g, "Math.cosh")
  parsed = parsed.replace(/\btanh\b/g, "Math.tanh")
  
  // Replace logarithmic functions
  parsed = parsed.replace(/\bln\b/g, "Math.log")
  parsed = parsed.replace(/\blog\b/g, "Math.log10")
  parsed = parsed.replace(/\bexp\b/g, "Math.exp")
  
  // Replace other mathematical functions
  parsed = parsed.replace(/\bsqrt\b/g, "Math.sqrt")
  parsed = parsed.replace(/\bcbrt\b/g, "Math.cbrt")
  parsed = parsed.replace(/\babs\b/g, "Math.abs")
  parsed = parsed.replace(/\bfloor\b/g, "Math.floor")
  parsed = parsed.replace(/\bceil\b/g, "Math.ceil")
  parsed = parsed.replace(/\bpow\b/g, "Math.pow")
  
  // Handle powers - convert x^n to x**n
  parsed = parsed.replace(/\^/g, "**")
  
  // Handle implicit multiplication
  // Add * between number and x (e.g., 2x -> 2*x)
  parsed = parsed.replace(/(\d+)([a-z])/g, "$1*$2")
  // Add * between ) and x or ( (e.g., )x -> )*x, )( -> )*(
  parsed = parsed.replace(/\)([a-z]|\()/g, ")*$1")
  // Add * between x and ( (e.g., x( -> x*(
  parsed = parsed.replace(/([a-z])\(/g, "$1*(")
  
  return parsed
}

// Function to safely evaluate mathematical expressions
function evaluateFunction(x: number, functionStr: string): number {
  try {
    const parsed = parseFunction(functionStr)
    const sanitized = parsed.replace(/\bx\b/g, x.toString())
    
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
  const [functionInput, setFunctionInput] = useState("x^2 + 3x")
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
    setFunctionInput("x^2 + 3x")
    setLowerBound("0")
    setUpperBound("2")
    setSegments("1000")
    setMethod("trapezoid")
    setResult(null)
    setError(null)
  }

  const insertAtCursor = (text: string) => {
    // For the math input, we'll update the function directly
    const newValue = functionInput + text
    setFunctionInput(newValue)
  }

  const clearFunction = () => {
    setFunctionInput("")
  }

  const backspace = () => {
    if (functionInput.length > 0) {
      setFunctionInput(functionInput.slice(0, -1))
    }
  }

  const mathButtons = [
    // Variables and constants
    { label: "x", value: "x", color: "bg-blue-800/50 text-blue-300 hover:bg-blue-700/60" },
    { label: "π", value: "pi", color: "bg-purple-800/50 text-purple-300 hover:bg-purple-700/60" },
    { label: "e", value: "e", color: "bg-purple-800/50 text-purple-300 hover:bg-purple-700/60" },
    { label: "∞", value: "Infinity", color: "bg-purple-800/50 text-purple-300 hover:bg-purple-700/60" },

    // Basic operations
    { label: "+", value: " + ", color: "bg-green-800/50 text-green-300 hover:bg-green-700/60" },
    { label: "−", value: " - ", color: "bg-green-800/50 text-green-300 hover:bg-green-700/60" },
    { label: "×", value: " * ", color: "bg-green-800/50 text-green-300 hover:bg-green-700/60" },
    { label: "÷", value: " / ", color: "bg-green-800/50 text-green-300 hover:bg-green-700/60" },

    // Powers and roots
    { label: <span>x<sup className="text-xs">2</sup></span>, value: "x^2", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: <span>x<sup className="text-xs">3</sup></span>, value: "x^3", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: <span>x<sup className="text-xs">n</sup></span>, value: "x^", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: <span>x<sup className="text-xs">(n)</sup></span>, value: "x^(", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: "^", value: "^", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: "√", value: "sqrt(", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },
    { label: <span>∛</span>, value: "cbrt(", color: "bg-orange-800/50 text-orange-300 hover:bg-orange-700/60" },

    // Trigonometric functions
    { label: "sin", value: "sin(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },
    { label: "cos", value: "cos(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },
    { label: "tan", value: "tan(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },
    { label: "sec", value: "sec(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },
    { label: "csc", value: "csc(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },
    { label: "cot", value: "cot(", color: "bg-cyan-800/50 text-cyan-300 hover:bg-cyan-700/60" },

    // Inverse trigonometric functions
    { label: <span>sin<sup className="text-xs">-1</sup></span>, value: "asin(", color: "bg-teal-800/50 text-teal-300 hover:bg-teal-700/60" },
    { label: <span>cos<sup className="text-xs">-1</sup></span>, value: "acos(", color: "bg-teal-800/50 text-teal-300 hover:bg-teal-700/60" },
    { label: <span>tan<sup className="text-xs">-1</sup></span>, value: "atan(", color: "bg-teal-800/50 text-teal-300 hover:bg-teal-700/60" },

    // Logarithmic and exponential functions
    { label: "ln", value: "ln(", color: "bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/60" },
    { label: <span>log<sub className="text-xs">10</sub></span>, value: "log(", color: "bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/60" },
    { label: <span>e<sup className="text-xs">x</sup></span>, value: "exp(", color: "bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/60" },
    { label: <span>10<sup className="text-xs">x</sup></span>, value: "pow(10,", color: "bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/60" },

    // Hyperbolic functions
    { label: "sinh", value: "sinh(", color: "bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/60" },
    { label: "cosh", value: "cosh(", color: "bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/60" },
    { label: "tanh", value: "tanh(", color: "bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/60" },

    // Other functions
    { label: "|x|", value: "abs(", color: "bg-rose-800/50 text-rose-300 hover:bg-rose-700/60" },
    { label: "⌊x⌋", value: "floor(", color: "bg-rose-800/50 text-rose-300 hover:bg-rose-700/60" },
    { label: "⌈x⌉", value: "ceil(", color: "bg-rose-800/50 text-rose-300 hover:bg-rose-700/60" },

    // Parentheses and separators
    { label: "(", value: "(", color: "bg-gray-700/50 text-gray-300 hover:bg-gray-600/60" },
    { label: ")", value: ")", color: "bg-gray-700/50 text-gray-300 hover:bg-gray-600/60" },
    { label: ",", value: ",", color: "bg-gray-700/50 text-gray-300 hover:bg-gray-600/60" },
  ]

  const examples = [
    { label: "Kuadrat", value: "x^2 + 3x", icon: "📈", color: "bg-blue-800/50 text-blue-300", display: <span>x<sup>2</sup> + 3x</span> },
    { label: "Sinus", value: "sin(x)", icon: "🌊", color: "bg-purple-800/50 text-purple-300", display: "sin(x)" },
    { label: "Eksponensial", value: "exp(x)", icon: "⚡", color: "bg-yellow-800/50 text-yellow-300", display: <span>e<sup>x</sup></span> },
    { label: "Polinomial", value: "x^3 - 2x^2 + x - 1", icon: "🔢", color: "bg-green-800/50 text-green-300", display: <span>x<sup>3</sup> - 2x<sup>2</sup> + x - 1</span> },
    { label: "Pangkat Kompleks", value: "x^(n-1) + x^(2+1)", icon: "🧮", color: "bg-red-800/50 text-red-300", display: <span>x<sup>(n-1)</sup> + x<sup>(2+1)</sup></span> },
    { label: "Trigonometri", value: "sin(x) + cos(x)", icon: "📐", color: "bg-indigo-800/50 text-indigo-300", display: "sin(x) + cos(x)" },
    { label: "Logaritma", value: "ln(x) + log(x)", icon: "📊", color: "bg-emerald-800/50 text-emerald-300", display: <span>ln(x) + log<sub>10</sub>(x)</span> },
  ]

  return (
    <div className="min-h-screen bg-gray-950 overscroll-none">
      {/* Futuristic Header */}
      <div className="bg-black border-b border-cyan-800/50 shadow-lg shadow-cyan-500/20">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Calculator className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 h-8 w-8 bg-cyan-400/20 rounded-full blur-md animate-pulse"></div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-wide">KALKULATOR INTEGRAL NUMERIK</h1>
              <p className="text-sm text-cyan-300 font-medium tracking-wider">MASUKKAN FUNGSI DENGAN NOTASI NATURAL: x^2, sin(x), sqrt(x)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 overscroll-none">
        <div className="grid lg:grid-cols-2 gap-6 overscroll-none">
          {/* Input Section */}
          <div className="space-y-4 overscroll-none">
            {/* Function Input */}
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 space-y-4 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Input Fungsi</h3>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="function" className="text-sm font-medium text-cyan-300">
                  Fungsi f(x) *
                </Label>

                {/* Function Input Field */}
                <div className="relative">
                  <MathInput
                    id="function"
                    value={functionInput}
                    onChange={setFunctionInput}
                    placeholder="Ketik fungsi Anda, contoh: x^2 + 3x atau sin(x)"
                    className="w-full"
                  />
                  <Button
                    onClick={clearFunction}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mathematical Keyboard */}
                <div className="bg-gray-800 border border-cyan-600/40 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-300">Keyboard Matematika</span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {mathButtons.map((btn, index) => (
                      <Button
                        key={index}
                        onClick={() => insertAtCursor(btn.value)}
                        variant="outline"
                        size="sm"
                        className={`h-10 text-sm font-semibold border border-cyan-500/30 ${btn.color} transition-all hover:scale-105 hover:border-cyan-400/60`}
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
                      className="flex-1 bg-red-900/30 text-red-300 hover:bg-red-800/40 border border-red-500/30 hover:border-red-400/60"
                    >
                      <Delete className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                    <Button
                      onClick={clearFunction}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gray-700/50 text-gray-300 hover:bg-gray-600/60 border border-gray-500/30 hover:border-gray-400/60"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Bersihkan
                    </Button>
                  </div>
                </div>

                {/* Example Functions */}
                <div className="space-y-2">
                  <p className="text-sm text-cyan-300 font-medium">Contoh fungsi populer:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {examples.map((example) => (
                      <Button
                        key={example.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setFunctionInput(example.value)}
                        className={`justify-start text-left h-auto p-3 ${example.color} border border-cyan-500/30 hover:scale-105 transition-transform hover:border-cyan-400/60`}
                      >
                        <span className="text-lg mr-2">{example.icon}</span>
                        <div>
                          <div className="font-semibold">{example.label}</div>
                          <div className="text-xs opacity-75">{example.display || example.value}</div>
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
                  <Label htmlFor="lower" className="text-sm font-semibold text-cyan-300">
                    Batas Bawah (a)
                  </Label>
                  <Input
                    id="lower"
                    type="number"
                    value={lowerBound}
                    onChange={(e) => setLowerBound(e.target.value)}
                    step="any"
                    className="text-lg p-3 bg-gray-800 border border-cyan-500/30 text-white focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upper" className="text-sm font-semibold text-cyan-300">
                    Batas Atas (b)
                  </Label>
                  <Input
                    id="upper"
                    type="number"
                    value={upperBound}
                    onChange={(e) => setUpperBound(e.target.value)}
                    step="any"
                    className="text-lg p-3 bg-gray-800 border border-cyan-500/30 text-white focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Segments and Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segments" className="text-sm font-semibold text-cyan-300">
                    Jumlah Segmen
                  </Label>
                  <Input
                    id="segments"
                    type="number"
                    value={segments}
                    onChange={(e) => setSegments(e.target.value)}
                    min="1"
                    className="text-lg p-3 bg-gray-800 border border-cyan-500/30 text-white focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method" className="text-sm font-semibold text-cyan-300">
                    Metode Integrasi
                  </Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="text-lg p-3 bg-gray-800 border border-cyan-500/30 text-white focus:border-cyan-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-cyan-500/30">
                      <SelectItem value="trapezoid" className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <span>📊</span>
                          Aturan Trapezoid
                        </div>
                      </SelectItem>
                      <SelectItem value="simpson" className="text-white hover:bg-gray-700">
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
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white p-3 text-lg font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
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
                <Button onClick={resetForm} variant="outline" className="px-6 border border-gray-500/30 text-gray-300 hover:bg-gray-700/50 hover:border-gray-400/60">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results and Info */}
          <div className="space-y-4 overscroll-none">
            {/* Results */}
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Hasil Perhitungan</h3>
              </div>
              
              {error && (
                <Alert variant="destructive" className="border-red-500/30 bg-red-900/30 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {result !== null && (
                <Alert className="border-cyan-500/30 bg-cyan-900/30 mb-4">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-300 mb-1">{result.toFixed(6)}</div>
                        <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">Hasil Integral</Badge>
                      </div>

                      <Separator className="bg-cyan-500/30" />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-cyan-400">Metode:</span>
                          <span className="font-semibold text-white">
                            {method === "trapezoid" ? "Trapezoid" : "Simpson 1/3"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-400">Fungsi:</span>
                          <span className="text-xs text-white"><MathDisplay expression={functionInput} /></span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-400">Batas:</span>
                          <span className="text-white">[{lowerBound}, {upperBound}]</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-400">Segmen:</span>
                          <span className="text-white">{segments}</span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!result && !error && (
                <div className="text-center py-8 text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50 text-cyan-400" />
                  <p>Masukkan parameter dan klik "Hitung Integral" untuk melihat hasil</p>
                </div>
              )}
            </div>

            {/* Method Info */}
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Info Metode</h3>
              </div>
              
              {method === "trapezoid" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <h4 className="font-semibold text-cyan-300">Aturan Trapezoid</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Memperkirakan integral dengan membagi area di bawah kurva menjadi trapezoid-trapezoid. Metode ini
                    sederhana dan cukup akurat untuk fungsi yang tidak terlalu kompleks.
                  </p>
                  <Badge variant="secondary" className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">
                    Akurasi: Baik
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    <h4 className="font-semibold text-cyan-300">Aturan Simpson 1/3</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Menggunakan kurva parabola untuk memperkirakan area, memberikan hasil yang lebih akurat
                    dibandingkan metode trapezoid, terutama untuk fungsi yang halus.
                  </p>
                  <Badge variant="secondary" className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">
                    Akurasi: Sangat Baik
                  </Badge>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Tips Penggunaan</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-cyan-300">🎯 Cara Input Fungsi:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30"><span>x<sup>2</sup></span></Badge>
                      <span className="text-gray-300">untuk x pangkat 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30"><span>x<sup>(n-1)</sup></span></Badge>
                      <span className="text-gray-300">pangkat kompleks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">sin(x)</Badge>
                      <span className="text-gray-300">fungsi trigonometri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">√x</Badge>
                      <span className="text-gray-300">akar kuadrat (sqrt)</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-cyan-500/30" />

                <div>
                  <h4 className="font-semibold text-sm mb-2 text-cyan-300">📚 Fungsi Lainnya:</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <Badge className="bg-cyan-800/50 text-cyan-300 border border-cyan-500/30">sin, cos, tan</Badge>
                    <Badge className="bg-gray-700/50 text-gray-300 border border-gray-500/30">ln, log, exp</Badge>
                    <Badge className="bg-purple-800/50 text-purple-300 border border-purple-500/30">π, e, ∞</Badge>
                    <Badge className="bg-rose-800/50 text-rose-300 border border-rose-500/30">√, ∛, |x|</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
