import OpenAI from "openai";
import { log } from "../vite";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze smart contract code and provide suggestions for improvements
 */
export async function analyzeSmartContract(contractCode: string, query?: string) {
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const userContent = query 
      ? `Smart Contract Code to analyze:\n\n${contractCode}\n\nSpecific question: ${query}`
      : `Smart Contract Code to analyze:\n\n${contractCode}`;
      
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a smart contract security expert specializing in Solidity and EVM-compatible blockchains.
          Analyze the provided contract code for:
          1. Security vulnerabilities
          2. Gas optimization opportunities
          3. Code quality issues
          4. Best practice violations
          
          Format your response as JSON with these sections:
          - vulnerabilities: Array of found vulnerabilities with description, severity (critical, high, medium, low), and suggested fix
          - gasOptimizations: Array of optimization opportunities with description and code example
          - codeQuality: Array of code quality issues with description and improvement suggestion
          - bestPractices: Array of best practices that should be implemented
          - overallRisk: String assessment from "Very Low" to "Critical"
          - improvedCode: Complete improved version of the contract`
        },
        {
          role: "user",
          content: userContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error: any) {
    log(`OpenAI API error: ${error.message}`, "ai");
    throw new Error(`Failed to analyze smart contract: ${error.message}`);
  }
}

/**
 * Generate code improvements for a specific part of a smart contract
 */
export async function improveContractCode(contractCode: string, feedback: string) {
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a smart contract security expert. You will be given a smart contract and feedback/instructions on how to improve it.
          Provide the improved version of the code with comments explaining the changes.
          Focus on making the contract more secure, efficient, and following best practices.`
        },
        {
          role: "user",
          content: `Smart Contract Code:\n\n${contractCode}\n\nImprovement requested: ${feedback}`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    log(`OpenAI API error: ${error.message}`, "ai");
    throw new Error(`Failed to improve contract code: ${error.message}`);
  }
}

/**
 * Explain a specific part of a smart contract in simple terms
 */
export async function explainContractCode(contractCode: string, query: string) {
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a smart contract expert who explains complex code in simple terms.
          Explain the provided smart contract code in a way that would be understandable to someone with basic programming knowledge but limited blockchain experience.
          Focus on explaining the functionality, purpose, and potential risks.`
        },
        {
          role: "user",
          content: `Smart Contract Code:\n\n${contractCode}\n\nSpecific question: ${query}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    log(`OpenAI API error: ${error.message}`, "ai");
    throw new Error(`Failed to explain contract code: ${error.message}`);
  }
}

export const ai = {
  analyzeSmartContract,
  improveContractCode,
  explainContractCode,
};