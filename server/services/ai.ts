import OpenAI from "openai";
import type { AIResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-placeholder"
});

export class AIService {
  async generateSQLQuery(prompt: string, tableSchema?: string): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a SQL expert assistant for a database management system. 
      Help users write SQL queries, optimize performance, and explain database concepts.
      Always provide valid SQL syntax and explain your reasoning.
      
      ${tableSchema ? `Available tables and schema:\n${tableSchema}` : ''}
      
      Respond with JSON in this format:
      {
        "message": "Your explanation or response",
        "sqlQuery": "SQL query if applicable",
        "explanation": "Detailed explanation of the query"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "I'm here to help with your database questions!",
        sqlQuery: result.sqlQuery,
        explanation: result.explanation,
      };
    } catch (error) {
      console.error('AI service error:', error);
      return {
        message: "I'm currently unavailable. Please try again later or write your SQL query manually.",
        sqlQuery: undefined,
        explanation: undefined,
      };
    }
  }

  async optimizeQuery(sqlQuery: string): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a SQL optimization expert. 
      Analyze the provided SQL query and suggest optimizations for better performance.
      Consider indexes, query structure, and best practices.
      
      Respond with JSON in this format:
      {
        "message": "Optimization summary",
        "sqlQuery": "Optimized SQL query",
        "explanation": "Detailed explanation of optimizations made"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please optimize this SQL query:\n\n${sqlQuery}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "Here are some optimization suggestions:",
        sqlQuery: result.sqlQuery || sqlQuery,
        explanation: result.explanation,
      };
    } catch (error) {
      console.error('AI optimization error:', error);
      return {
        message: "Unable to optimize query at the moment. Please try again later.",
        sqlQuery: sqlQuery,
        explanation: undefined,
      };
    }
  }

  async explainQuery(sqlQuery: string): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a SQL education expert.
      Explain the provided SQL query in simple terms, breaking down each part.
      Help users understand what the query does and how it works.
      
      Respond with JSON in this format:
      {
        "message": "Simple explanation of the query",
        "explanation": "Detailed breakdown of each part"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please explain this SQL query:\n\n${sqlQuery}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "Here's what this query does:",
        explanation: result.explanation,
      };
    } catch (error) {
      console.error('AI explanation error:', error);
      return {
        message: "Unable to explain query at the moment. Please try again later.",
        explanation: undefined,
      };
    }
  }
}

export const aiService = new AIService();
