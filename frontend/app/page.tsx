'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

export default function Demo() {
  const [url, setUrl] = useState('')
  const [processStep, setProcessStep] = useState(0)
  const [showReasoning, setShowReasoning] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [email, setEmail] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [analysisRationale, setAnalysisRationale] = useState<string[]>([])
  const [error, setError] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [copied, setCopied] = useState(false)
  const [improvePrompt, setImprovePrompt] = useState('')
  const [isImprovingEmail, setIsImprovingEmail] = useState(false)
  const [improveDialogOpen, setImproveDialogOpen] = useState(false)

  const aiSteps = [
    { title: 'Sensing', description: 'Scraping LinkedIn profile data' },
    { title: 'Thinking', description: 'Extracting name, title, and company' },
    { title: 'Retrieving', description: 'Finding and validating email address' },
    { title: 'Planning', description: 'Analyzing their page to shape email' },
    { title: 'Executing', description: 'Generating and finalizing personalized email' }
  ];

  const handleAnalyzeProfile = async () => {
    if (!url || !prompt) return
  
    setProcessStep(1)
    setIsEmailLoading(true)
    setError('')
    setShowReasoning(false)
  
    const progressInterval = setInterval(() => {
      setProcessStep(prev => {
        if (prev >= 5) {
          clearInterval(progressInterval)
          return 5
        }
        return prev + 1
      })
    }, 3000)
  
    try {
      const [response] = await Promise.all([
        fetch('http://127.0.0.1:5000/scrape-linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, prompt })
        }).then(res => res.json()),
        new Promise(res => setTimeout(res, 10000))
      ])
  
      if (response.error) {
        setError(response.error)
      } else {
        setEmail(response.email)
        setRecipientName(response.recipient_name)
        setEmailContent(response.groq_response)
        setAnalysisRationale(response.analysis_rationale)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleImproveEmail = async () => {
    console.log('Improve Email Clicked');
    console.log('Improve Prompt:', improvePrompt);
    console.log('Email Content:', emailContent);
    
    if (!improvePrompt || !emailContent) {
      console.log('Improve Prompt, Email Content, or Email is empty');
      return;
    }
    
    setIsImprovingEmail(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:5000/improve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailContent, 
          prompt: improvePrompt,
          recipient_name: recipientName
        })
      }).then(res => res.json());
      
      if (response.error) {
        setError(response.error);
        console.log('Error:', response.error);
      } else {
        setEmailContent(response.improved_email);
        setAnalysisRationale(response.improvement_rationale);
        setImproveDialogOpen(false);
        setImprovePrompt('');
        console.log('Email Improved Successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      console.log('Error:', err.message);
    } finally {
      setIsImprovingEmail(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            <span className="text-blue-600">Lead</span>Hunter
          </h1>
          <p className="text-gray-500">Enterprise Email Lead Intelligence Platform</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Input 
                placeholder="Paste LinkedIn profile URL"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Input
                placeholder="Enter campaign prompt"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={handleAnalyzeProfile}
                disabled={isEmailLoading}
              >
                Analyze Profile
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {processStep > 0 && (
              <>
                <Progress value={processStep * 20} className="h-1 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-in-out" />
                <div className="grid grid-cols-5 gap-4">
                  {aiSteps.map((step, index) => (
                    <div 
                      key={step.title}
                      className={`p-4 rounded-lg border ${index < processStep ? 
                        'border-blue-500 bg-blue-50' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Badge 
                        variant={index < processStep ? 'default' : 'secondary'} 
                        className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        Step {index + 1}
                      </Badge>
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {processStep >= 5 && (
              <div className="space-y-6">
                <Separator className="bg-gray-200" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-xl">✓</span>
                    <h2 className="text-lg font-medium text-gray-900">Identified Contact:</h2>
                    <div className="relative inline-block">
                      <code 
                        className={`px-3 py-1 rounded cursor-pointer transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}
                        onClick={() => copyToClipboard(email)}
                        title="Click to copy to clipboard"
                      >
                        {email}
                      </code>
                      {copied && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Card className="bg-gray-50 border border-gray-200">
                    <CardContent className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-700">
                      {isEmailLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-pulse flex flex-col items-center space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      ) : emailContent}
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleAnalyzeProfile}
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? "Regenerating..." : "Regenerate"}
                      </Button>
                      <Dialog open={improveDialogOpen} onOpenChange={setImproveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                            disabled={isEmailLoading}
                          >
                            Improve Email
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Improve Email</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm text-gray-500 mb-4">Enter instructions on how you'd like to improve this email:</p>
                            <Input
                              placeholder="e.g., Make it more persuasive, focus on benefits, shorten it"
                              className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 w-full"
                              value={improvePrompt}
                              onChange={(e) => setImprovePrompt(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                              onClick={handleImproveEmail}
                              disabled={isImprovingEmail || !improvePrompt}
                            >
                              {isImprovingEmail ? "Improving..." : "Improve Email"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        disabled={isEmailLoading}
                      >
                        <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">Send Email</a>
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
                    <h3 className="font-medium text-gray-900">Analysis Rationale</h3>
                  </div>
                  
                  {showReasoning && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm text-gray-600 border border-gray-200">
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

        <p className="text-center text-sm text-gray-500">
          Enterprise-grade backend ensured for high accuracy
        </p>
      </div>
    </div>
  )

}