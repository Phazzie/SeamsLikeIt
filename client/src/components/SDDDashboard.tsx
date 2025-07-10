import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  name: string
  x: number
  y: number
}

interface Seam {
  id: string
  from: string
  to: string
  contract: string
}

export default function SDDDashboard() {
  const [requirements, setRequirements] = useState('')
  const [domain, setDomain] = useState('general')
  const [components, setComponents] = useState<Component[]>([])
  const [seams, setSeams] = useState<Seam[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [authToken, setAuthToken] = useState('')
  const [cost, setCost] = useState(0)

  // Login on mount
  useEffect(() => {
    login()
  }, [])

  const login = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo123' })
      })
      const data = await response.json()
      if (data.token) {
        setAuthToken(data.token)
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const analyzeRequirements = async () => {
    if (!requirements || !authToken) return
    
    setIsLoading(true)
    setCurrentStep(1)
    
    try {
      const response = await fetch('/api/tools/seam_analyze_requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ requirements, domain })
      })
      
      const result = await response.json()
      if (result.success && result.data) {
        // Transform components for visualization
        const newComponents = result.data.components.map((comp: any, index: number) => ({
          id: comp.id,
          name: comp.name,
          x: 100 + (index % 3) * 250,
          y: 100 + Math.floor(index / 3) * 200
        }))
        setComponents(newComponents)
        
        // Transform seams
        const newSeams = result.data.seams.map((seam: any) => ({
          id: seam.id,
          from: seam.participants.producer,
          to: seam.participants.consumer,
          contract: seam.name
        }))
        setSeams(newSeams)
        
        setCost(prev => prev + 0.0006)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateContracts = async () => {
    if (!authToken || currentStep < 2) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/tools/seam_generate_contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          components, 
          seams,
          requirements,
          domain 
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setCost(prev => prev + 0.0008)
        setCurrentStep(3)
        // Could store contracts in state if needed
      }
    } catch (error) {
      console.error('Contract generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createStubs = async () => {
    if (!authToken || currentStep < 3) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/tools/seam_create_stubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          components, 
          seams,
          requirements,
          domain 
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setCost(prev => prev + 0.0010)
        setCurrentStep(4)
        // Could store stub code in state if needed
      }
    } catch (error) {
      console.error('Stub creation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCode = async () => {
    if (!authToken || currentStep < 4) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/tools/seam_orchestrate_simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          requirements,
          domain,
          parallel: false
        })
      })
      
      const result = await response.json()
      if (result.success && result.data) {
        // Create a blob and download
        const codeContent = JSON.stringify(result.data, null, 2)
        const blob = new Blob([codeContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'seam-project.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setCost(prev => prev + 0.0020)
        setCurrentStep(5)
      }
    } catch (error) {
      console.error('Code download failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = ['Requirements', 'Components', 'Contracts', 'Stubs', 'Code']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Seam-Driven Development
        </h1>
        <p className="text-gray-300 mb-8">Transform requirements into architecture with AI</p>
        
        {/* Timeline */}
        <div className="flex items-center justify-between mb-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                index <= currentStep 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110" 
                  : "bg-gray-700 text-gray-400"
              )}>
                {index + 1}
              </div>
              <span className={cn(
                "ml-2 mr-4 transition-all",
                index <= currentStep ? "text-white font-semibold" : "text-gray-500"
              )}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-1 transition-all",
                  index < currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-700"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Requirements</h2>
            
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe what you want to build..."
              className="w-full h-48 p-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            
            <div className="mt-4 flex items-center gap-4">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="healthcare">Healthcare 🏥</option>
                <option value="ecommerce">E-commerce 🛒</option>
                <option value="fintech">Fintech 💰</option>
              </select>
              
              <button
                onClick={analyzeRequirements}
                disabled={isLoading || !requirements}
                className={cn(
                  "px-6 py-2 rounded-lg font-semibold transition-all",
                  isLoading || !requirements
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105"
                )}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Requirements'}
              </button>
            </div>
            
            {/* Cost Tracker */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Session Cost:</span>
                <span className="text-2xl font-bold text-green-400">
                  ${cost.toFixed(4)}
                </span>
              </div>
            </div>
            
            {/* Lessons Learned Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
              <h3 className="text-lg font-semibold mb-2 text-blue-300">💡 Seam-Driven Insights</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• If debugging takes >30 min, regenerate the component</li>
                <li>• Hidden seams often lurk in error handling</li>
                <li>• More components = simpler system</li>
                <li>• Over-identify seams, then consolidate</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Architecture Visualization</h2>
            
            <div className="relative h-96 bg-gray-900/50 rounded-lg border border-gray-600 overflow-hidden">
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Components will appear here after analysis</p>
                </div>
              ) : (
                <svg className="w-full h-full">
                  {/* Draw seams (connections) */}
                  {seams.map(seam => {
                    const fromComp = components.find(c => c.id === seam.from)
                    const toComp = components.find(c => c.id === seam.to)
                    if (!fromComp || !toComp) return null
                    
                    return (
                      <g key={seam.id}>
                        <line
                          x1={fromComp.x + 75}
                          y1={fromComp.y + 30}
                          x2={toComp.x + 75}
                          y2={toComp.y + 30}
                          stroke="url(#seamGradient)"
                          strokeWidth="2"
                          className="animate-pulse"
                        />
                        <text
                          x={(fromComp.x + toComp.x) / 2 + 75}
                          y={(fromComp.y + toComp.y) / 2 + 30}
                          fill="#9CA3AF"
                          fontSize="12"
                          textAnchor="middle"
                          className="bg-gray-900"
                        >
                          {seam.contract}
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Draw components */}
                  {components.map(comp => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y})`}>
                      <rect
                        width="150"
                        height="60"
                        rx="8"
                        fill="url(#componentGradient)"
                        stroke="#4B5563"
                        strokeWidth="2"
                        className="cursor-pointer hover:stroke-blue-400 transition-all"
                      />
                      <text
                        x="75"
                        y="35"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {comp.name}
                      </text>
                    </g>
                  ))}
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="componentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="seamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
            
            {/* Action Buttons */}
            {components.length > 0 && (
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={generateContracts}
                  disabled={isLoading || currentStep < 2}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all font-semibold",
                    isLoading || currentStep < 2
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                  )}
                >
                  Generate Contracts
                </button>
                <button 
                  onClick={createStubs}
                  disabled={isLoading || currentStep < 3}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all font-semibold",
                    isLoading || currentStep < 3
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 transform hover:scale-105"
                  )}
                >
                  Create Stubs
                </button>
                <button 
                  onClick={downloadCode}
                  disabled={isLoading || currentStep < 4}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all font-semibold",
                    isLoading || currentStep < 4
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 transform hover:scale-105"
                  )}
                >
                  Download Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}