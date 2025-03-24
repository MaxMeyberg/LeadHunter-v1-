'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function Demo() {
  const [url, setUrl] = useState('')
  const [processStep, setProcessStep] = useState(0)
  const [showReasoning, setShowReasoning] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [email, setEmail] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [analysisRationale, setAnalysisRationale] = useState<string[]>([])
  const [recipientName, setRecipientName] = useState('')
  const [copied, setCopied] = useState(false)
  const [improvePrompt, setImprovePrompt] = useState('')
  const [isImprovingEmail, setIsImprovingEmail] = useState(false)
  const [improveDialogOpen, setImproveDialogOpen] = useState(false)
  const [showLinkedInSuggestions, setShowLinkedInSuggestions] = useState(false)
  const [showCampaignSuggestions, setShowCampaignSuggestions] = useState(false)

  const linkedInSuggestions = [
    "https://www.linkedin.com/in/jenhsunhuang/",
    "https://www.linkedin.com/in/satyanadella/",
    "https://www.linkedin.com/in/williamhgates/",
    "https://www.linkedin.com/in/sundarpichai/",
  ]

  const campaignSuggestions = [
    "Looking to discuss how our solution can improve your sales efficiency.",
    "Would like to share how our platform can reduce operational costs.",
    "Interested in connecting about potential partnership opportunities.",
    "I would like to learn more about your company's products and how we can help you improve your sales efficiency."
  ]

  const aiSteps = [
    { title: 'Sensing', description: 'Scraping LinkedIn profile data' },
    { title: 'Thinking', description: 'Extracting name, title, and company' },
    { title: 'Retrieving', description: 'Finding and validating email address' },
    { title: 'Planning', description: 'Analyzing their page to shape email' },
    { title: 'Executing', description: 'Generating and finalizing personalized email' }
  ];

  const handleAnalyzeProfile = async () => {
    if (!url || !prompt) return

    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;

    if (!linkedInRegex.test(url)) {
      toast.error('Invalid LinkedIn URL. Please enter a valid profile URL.')
      return;
    }
    
    setProcessStep(1)
    setIsEmailLoading(true)
    setShowReasoning(false)
  
    const progressInterval = setInterval(() => {
      setProcessStep(prev => {
        if (prev >= 3) {
          clearInterval(progressInterval)
          return 3
        }
        return prev + 1
      })
    }, 3000)
  
    try {
      const [response] = await Promise.all([
        fetch('https://leadhunterbackend.vercel.app/scrape-linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, prompt })
        }).then(res => res.json()),
        new Promise(res => setTimeout(res, 10000))
      ])
  
      if (response.error) {
        toast.error(`Error: ${response.error}`)
      } else {
        setEmail(response.email)
        setRecipientName(response.recipient_name)
        setEmailContent(response.groq_response)
        setAnalysisRationale(response.analysis_rationale)
        
        setProcessStep(4)
        setTimeout(() => {
          setProcessStep(5)
        }, 1500)
      }
    } catch (err) {
      toast.error(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleImproveEmail = async () => {
    if (!improvePrompt || !emailContent) {
      toast.error('Improve prompt or email content is empty')
      return;
    }
    
    setIsImprovingEmail(true);
    
    try {
      const response = await fetch('https://leadhunterbackend.vercel.app/improve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailContent, 
          prompt: improvePrompt,
          recipient_name: recipientName
        })
      }).then(res => res.json());
      
      if (response.error) {
        toast.error(`Error: ${response.error}`)
      } else {
        setEmailContent(response.improved_email);
        setAnalysisRationale(response.improvement_rationale);
        setImproveDialogOpen(false);
        setImprovePrompt('');
        toast.success('Email improved successfully')
      }
    } catch (err) {
      toast.error(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsImprovingEmail(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard')
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast.error(`Failed to copy text: ${err instanceof Error ? err.message : 'Unknown error'}`)
      });
  };

  const selectLinkedInSuggestion = (suggestion: string) => {
    setUrl(suggestion);
    setShowLinkedInSuggestions(false);
  };

  const selectCampaignSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setShowCampaignSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            <span className="text-blue-600">Lead</span>Hunter
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Enterprise Email Lead Intelligence Platform</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full relative">
                <Input 
                  placeholder="Paste LinkedIn profile URL"
                  className="w-full bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 mb-2 sm:mb-0"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setShowLinkedInSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLinkedInSuggestions(false), 200)}
                />
                {showLinkedInSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {linkedInSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-3 py-2 text-sm text-gray-900 opacity-80 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectLinkedInSuggestion(suggestion)}
                      >
                        {suggestion.slice(12, -1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full relative">
                <Input
                  placeholder="Enter campaign prompt"
                  className="w-full bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 mb-2 sm:mb-0"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setShowCampaignSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCampaignSuggestions(false), 200)}
                />
                {showCampaignSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {campaignSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-3 py-2 text-sm text-gray-900 opacity-80 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectCampaignSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={handleAnalyzeProfile}
                disabled={isEmailLoading || !url || !prompt}
              >
                Analyze Profile
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {processStep > 0 && (
              <>
                <Progress value={processStep * 20} className="h-1 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-in-out" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                  {aiSteps.map((step, index) => (
                    <div 
                      key={step.title}
                      className={`p-3 sm:p-4 rounded-lg border ${index < processStep ? 
                        'border-blue-500 bg-blue-50' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Badge 
                        variant={index < processStep ? 'default' : 'secondary'} 
                        className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        Step {index + 1}
                      </Badge>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{step.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {processStep >= 5 && (
              <div className="space-y-6">
                <Separator className="bg-gray-200" />

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-blue-600 text-xl">✓</span>
                    <h2 className="text-base sm:text-lg font-medium text-gray-900">Identified Contact:</h2>
                    <div className="relative inline-flex items-center gap-1 mt-1 sm:mt-0">
                      <code 
                        className={`px-2 sm:px-3 py-1 rounded transition-colors text-xs sm:text-sm ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}
                        title="Email address"
                      >
                        {email || 'No email found'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(email)}
                        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                      {copied && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Card className="bg-gray-50 border border-gray-200">
                    <CardContent className="p-3 sm:p-4 font-mono text-xs sm:text-sm whitespace-pre-wrap text-gray-700">
                      {isEmailLoading ? (
                        <div className="flex justify-center items-center py-6 sm:py-8">
                          <div className="animate-pulse flex flex-col items-center space-y-2">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      ) : emailContent}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <Button 
                          variant="outline" 
                          className="flex-1 sm:flex-initial text-xs sm:text-sm border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={handleAnalyzeProfile}
                          disabled={isEmailLoading}
                        >
                          {isEmailLoading ? "Regenerating..." : "Regenerate"}
                        </Button>
                        <Dialog open={improveDialogOpen} onOpenChange={setImproveDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-initial text-xs sm:text-sm border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                              disabled={isEmailLoading}
                            >
                              Improve Email
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg sm:w-full">
                            <DialogHeader>
                              <DialogTitle>Improve Email</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-sm text-gray-500 mb-4">Enter instructions on how you&apos;d like to improve this email:</p>
                              <Input
                                placeholder="e.g., Make it more persuasive, focus on benefits, shorten it"
                                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 w-full"
                                value={improvePrompt}
                                onChange={(e) => setImprovePrompt(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                onClick={handleImproveEmail}
                                disabled={isImprovingEmail || !improvePrompt}
                              >
                                {isImprovingEmail ? "Improving..." : "Improve Email"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button 
                        className="w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        disabled={isEmailLoading}
                      >
                        <a 
                          href={`mailto:${email || ''}?subject=${encodeURIComponent(prompt)}&body=${encodeURIComponent(emailContent)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full h-full block"
                        >
                          Send Email
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 cursor-pointer" 
                       onClick={() => setShowReasoning(!showReasoning)}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      {showReasoning ? '▼' : '▶'}
                    </Button>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Analysis Rationale</h3>
                  </div>
                  
                  {showReasoning && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 text-xs sm:text-sm text-gray-600 border border-gray-200">
                      {analysisRationale.map((reason: string, index: number) => (
                        <p key={index} className="flex gap-2">
                          <span className="text-blue-600">•</span>
                          {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-gray-500">
          Enterprise-grade backend ensured for high accuracy
        </p>
      </div>
    </div>
  )

}