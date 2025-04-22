import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/context/web3-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Bot,
  Search,
  ArrowRight,
  Code
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

type AuditPricing = {
  pricing: {
    [key: string]: {
      usdtPrice: number;
      bobPrice: number;
      exchangeRate: number;
    }
  },
  lastUpdated: string;
}

type AnalysisVulnerability = {
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  suggestedFix: string;
}

type ContractAnalysis = {
  vulnerabilities: AnalysisVulnerability[];
  gasOptimizations: {
    description: string;
    codeExample: string;
  }[];
  codeQuality: {
    description: string;
    improvementSuggestion: string;
  }[];
  bestPractices: string[];
  overallRisk: string;
  improvedCode: string;
}

export default function AuditPage() {
  const { isConnected, walletAddress } = useWeb3();
  const { toast } = useToast();
  const [contractAddress, setContractAddress] = useState("");
  const [contractSource, setContractSource] = useState("");
  const [auditType, setAuditType] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("audit");
  const [aiAnalysisQuery, setAiAnalysisQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<ContractAnalysis | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementFeedback, setImprovementFeedback] = useState("");
  const [improvedCode, setImprovedCode] = useState("");
  const [selectedVulnerability, setSelectedVulnerability] = useState<AnalysisVulnerability | null>(null);

  // Fetch dynamic pricing
  const { data: pricingData, isLoading: isPricingLoading } = useQuery<AuditPricing>({
    queryKey: ['/api/audit/pricing'],
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
  
  // Default audit pricing (used as fallback if API fails)
  const defaultAuditPricing = {
    basic: { usdtPrice: 500, bobPrice: 50000, exchangeRate: 0.01 },
    standard: { usdtPrice: 1000, bobPrice: 100000, exchangeRate: 0.01 },
    premium: { usdtPrice: 2500, bobPrice: 250000, exchangeRate: 0.01 },
    comprehensive: { usdtPrice: 5000, bobPrice: 500000, exchangeRate: 0.01 }
  };
  
  // Get pricing based on API data or fallback to defaults
  const getPricing = () => {
    if (pricingData && pricingData.pricing) {
      return pricingData.pricing;
    }
    return defaultAuditPricing;
  };
  
  // Helper function to analyze the smart contract with AI
  const analyzeContract = async () => {
    if (!contractSource) {
      toast({
        title: "Missing Contract Source",
        description: "Please provide the contract source code for analysis",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAiResult(null);
    
    try {
      const response = await apiRequest('/api/audit/analyze', {
        method: 'POST',
        body: JSON.stringify({
          contractCode: contractSource,
          query: aiAnalysisQuery || undefined
        })
      });
      
      setAiResult(response as ContractAnalysis);
      setActiveTab("analysis");
    } catch (error) {
      console.error('Error analyzing contract:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the smart contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to improve the contract code
  const improveContract = async () => {
    if (!contractSource || !improvementFeedback) {
      toast({
        title: "Missing Information",
        description: "Please provide both the contract code and improvement details",
        variant: "destructive",
      });
      return;
    }
    
    setIsImproving(true);
    
    try {
      const response = await apiRequest('/api/audit/improve', {
        method: 'POST',
        body: JSON.stringify({
          contractCode: contractSource,
          feedback: improvementFeedback
        })
      });
      
      const result = response as {improvedCode: string};
      setImprovedCode(result.improvedCode);
      setActiveTab("improved");
    } catch (error) {
      console.error('Error improving contract:', error);
      toast({
        title: "Improvement Failed",
        description: "Failed to generate improvements for the smart contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to submit a smart contract for audit",
        variant: "destructive",
      });
      return;
    }
    
    if (!contractAddress || !contractSource) {
      toast({
        title: "Missing Information",
        description: "Please provide both the contract address and source code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here we would typically send the request to the backend for processing
      // This is a simulated response for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Audit Request Submitted",
        description: `Your ${auditType} audit request has been received and is being processed.`,
      });
      
      // Reset form
      setContractAddress("");
      setContractSource("");
      setAuditType("basic");
    } catch (error) {
      console.error("Error submitting audit request:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit audit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Smart Contract Audit</h1>
        <p className="text-gray-400">
          Secure your smart contracts with our professional audit service
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="audit" className="text-center">
            <Shield className="mr-2 h-4 w-4" />
            Audit Request
          </TabsTrigger>
          <TabsTrigger value="ai-assist" className="text-center">
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-center" disabled={!aiResult}>
            <Search className="mr-2 h-4 w-4" />
            Analysis Results
          </TabsTrigger>
        </TabsList>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <TabsContent value="audit" className="space-y-6 mt-0">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Submit Smart Contract for Audit</CardTitle>
                  </div>
                  <CardDescription>
                    Our security experts will analyze your smart contract for vulnerabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="contract-address">Contract Address</Label>
                      <Input
                        id="contract-address"
                        placeholder="0x..."
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        className="bg-gray-700 border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        The deployed address of your smart contract on BSC or other EVM-compatible networks
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="contract-source">Contract Source Code</Label>
                      <Textarea
                        id="contract-source"
                        placeholder="// Paste your Solidity code here..."
                        value={contractSource}
                        onChange={(e) => setContractSource(e.target.value)}
                        className="min-h-[200px] bg-gray-700 border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        We require verified source code for a thorough audit
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="audit-type">Audit Type</Label>
                      <Select
                        value={auditType}
                        onValueChange={setAuditType}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select audit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Audit (500 USDT)</SelectItem>
                          <SelectItem value="standard">Standard Audit (1000 USDT)</SelectItem>
                          <SelectItem value="premium">Premium Audit (2500 USDT)</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive Audit (5000 USDT)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400 mt-1">
                        Choose the level of detail for your smart contract audit
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Price in USDT:</span>
                        <span className="font-bold">
                          {getPricing()[auditType as keyof typeof defaultAuditPricing]?.usdtPrice || 
                           defaultAuditPricing[auditType as keyof typeof defaultAuditPricing].usdtPrice} USDT
                        </span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm">Price in BOB 4.0:</span>
                        <span className="font-bold text-primary">
                          {getPricing()[auditType as keyof typeof defaultAuditPricing]?.bobPrice || 
                           defaultAuditPricing[auditType as keyof typeof defaultAuditPricing].bobPrice} BOB
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {isPricingLoading 
                          ? "Loading current prices..." 
                          : `Current exchange rate: 1 BOB = ${getPricing()[auditType as keyof typeof defaultAuditPricing]?.exchangeRate || 
                             defaultAuditPricing[auditType as keyof typeof defaultAuditPricing].exchangeRate} USDT`
                        }
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!isConnected || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Submit for Audit"}
                    </Button>
                    
                    {!isConnected && (
                      <div className="text-center text-sm text-amber-400">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Please connect your wallet to submit an audit request
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai-assist" className="space-y-6 mt-0">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>AI Smart Contract Assistant</CardTitle>
                  </div>
                  <CardDescription>
                    Get instant AI-powered analysis and improvements for your smart contract
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-contract-source">Contract Source Code</Label>
                      <Textarea
                        id="ai-contract-source"
                        placeholder="// Paste your Solidity code here..."
                        value={contractSource}
                        onChange={(e) => setContractSource(e.target.value)}
                        className="min-h-[200px] bg-gray-700 border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ai-query">Analysis Query (Optional)</Label>
                      <Textarea
                        id="ai-query"
                        placeholder="Specify what you want the AI to analyze, e.g., 'Check for reentrancy vulnerabilities' or 'Focus on gas optimization'"
                        value={aiAnalysisQuery}
                        onChange={(e) => setAiAnalysisQuery(e.target.value)}
                        className="h-20 bg-gray-700 border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Leave empty for a general security analysis
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={analyzeContract}
                        disabled={!contractSource || isAnalyzing}
                        className="flex-1"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Contract"}
                      </Button>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">Want to Improve Your Contract?</h3>
                      <div>
                        <Label htmlFor="improvement-feedback">Describe the Improvements</Label>
                        <Textarea
                          id="improvement-feedback"
                          placeholder="Describe what you want to improve, e.g., 'Optimize gas usage' or 'Fix the function that handles token transfers'"
                          value={improvementFeedback}
                          onChange={(e) => setImprovementFeedback(e.target.value)}
                          className="h-24 bg-gray-700 border-gray-600 mb-3"
                        />
                        
                        <Button
                          onClick={improveContract}
                          disabled={!contractSource || !improvementFeedback || isImproving}
                          className="w-full"
                        >
                          {isImproving ? "Generating Improvements..." : "Improve Contract"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-6 mt-0">
              {aiResult ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        <CardTitle>Analysis Results</CardTitle>
                      </div>
                      <Badge className={
                        aiResult.overallRisk === "High" ? "bg-red-500" :
                        aiResult.overallRisk === "Medium" ? "bg-amber-500" :
                        "bg-green-500"
                      }>
                        {aiResult.overallRisk} Risk
                      </Badge>
                    </div>
                    <CardDescription>
                      AI-powered security analysis of your smart contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Vulnerabilities</h3>
                      {aiResult.vulnerabilities.length > 0 ? (
                        <div className="space-y-3">
                          {aiResult.vulnerabilities.map((vuln, index) => (
                            <div 
                              key={index} 
                              className={`p-3 rounded-md border ${
                                vuln.severity === "critical" ? "border-red-600 bg-red-900 bg-opacity-20" :
                                vuln.severity === "high" ? "border-orange-600 bg-orange-900 bg-opacity-20" :
                                vuln.severity === "medium" ? "border-amber-600 bg-amber-900 bg-opacity-20" :
                                "border-blue-600 bg-blue-900 bg-opacity-20"
                              }`}
                              onClick={() => setSelectedVulnerability(vuln)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-medium">
                                  {vuln.description.length > 100 
                                    ? vuln.description.substring(0, 100) + "..." 
                                    : vuln.description}
                                </div>
                                <Badge className={
                                  vuln.severity === "critical" ? "bg-red-500" :
                                  vuln.severity === "high" ? "bg-orange-500" :
                                  vuln.severity === "medium" ? "bg-amber-500" :
                                  "bg-blue-500"
                                }>
                                  {vuln.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-green-400 p-3 bg-green-900 bg-opacity-20 rounded-md border border-green-700">
                          No vulnerabilities detected
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Gas Optimizations</h3>
                      <div className="space-y-3">
                        {aiResult.gasOptimizations.length > 0 ? (
                          aiResult.gasOptimizations.map((opt, index) => (
                            <div key={index} className="p-3 rounded-md border border-purple-600 bg-purple-900 bg-opacity-20">
                              <div className="font-medium mb-1">{opt.description}</div>
                              <div className="text-xs bg-gray-900 p-2 rounded mt-2 font-mono">
                                {opt.codeExample}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 p-3 bg-gray-800 rounded-md border border-gray-700">
                            No gas optimizations suggested
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Code Quality</h3>
                      <div className="space-y-3">
                        {aiResult.codeQuality.length > 0 ? (
                          aiResult.codeQuality.map((quality, index) => (
                            <div key={index} className="p-3 rounded-md border border-blue-600 bg-blue-900 bg-opacity-20">
                              <div className="font-medium mb-1">{quality.description}</div>
                              <div className="text-sm text-gray-300">{quality.improvementSuggestion}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 p-3 bg-gray-800 rounded-md border border-gray-700">
                            No code quality issues found
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                      <div className="p-3 rounded-md border border-gray-600 bg-gray-700 bg-opacity-20">
                        <ul className="list-disc pl-5 space-y-1">
                          {aiResult.bestPractices.map((practice, index) => (
                            <li key={index} className="text-sm">{practice}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <div className="text-gray-400 mb-3">No analysis results yet</div>
                  <Button
                    onClick={() => setActiveTab("ai-assist")}
                    variant="outline"
                    className="gap-2"
                  >
                    Go to AI Assistant <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Audit Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-blue-500 bg-opacity-20 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Submission</h3>
                    <p className="text-sm text-gray-400">
                      Submit your contract and choose audit type
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-blue-500 bg-opacity-20 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Payment</h3>
                    <p className="text-sm text-gray-400">
                      Pay with BOB 4.0 tokens to initiate the audit
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-blue-500 bg-opacity-20 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Analysis</h3>
                    <p className="text-sm text-gray-400">
                      Our experts perform thorough security analysis
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-blue-500 bg-opacity-20 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Report</h3>
                    <p className="text-sm text-gray-400">
                      Receive detailed findings and recommendations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Our Audit Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Vulnerability Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Code Quality & Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Gas Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Business Logic Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Best Practice Implementation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Remediation Guidance</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>AI-Powered Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Smart Contract Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Vulnerability Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Code Improvement Suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Gas Usage Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Best Practices Guidance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}