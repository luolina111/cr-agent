import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const analyzeCodeSnippet = createTool({
  id: "analyze-code-snippet",
  description: "分析代码片段并提供详细的代码审查建议",
  inputSchema: z.object({
    code: z.string().describe("要分析的代码"),
    language: z.string().optional().describe("编程语言"),
    filename: z.string().optional().describe("文件名"),
  }),
  outputSchema: z.object({
    issues: z.array(z.object({
      type: z.string(),
      severity: z.string(),
      line: z.number().optional(),
      message: z.string(),
      suggestion: z.string().optional(),
    })),
    metrics: z.object({
      complexity: z.string(),
      maintainability: z.string(),
      readability: z.string(),
    }),
    suggestions: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { code, language, filename } = context;
    
    // 代码行数统计
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // 基础静态分析
    const issues = [];
    const suggestions = [];
    
    // 检查代码长度
    if (lines.length > 100) {
      issues.push({
        type: "complexity",
        severity: "warning",
        message: "函数或类过长，建议拆分为更小的模块",
        suggestion: "考虑将大型函数拆分为多个小函数，提高代码可读性和可维护性"
      });
    }
    
    // 检查长行
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          type: "formatting",
          severity: "info",
          line: index + 1,
          message: "行长度超过120字符",
          suggestion: "建议将长行拆分为多行，提高代码可读性"
        });
      }
    });
    
    // 语言特定检查
    if (language === 'javascript' || language === 'typescript' || filename?.endsWith('.js') || filename?.endsWith('.ts')) {
      // JavaScript/TypeScript 特定检查
      if (code.includes('var ')) {
        issues.push({
          type: "best-practice",
          severity: "warning",
          message: "建议使用 let 或 const 替代 var",
          suggestion: "使用 let 用于可变变量，const 用于常量"
        });
      }
      
      if (code.includes('console.log')) {
        issues.push({
          type: "best-practice",
          severity: "info",
          message: "发现 console.log 语句",
          suggestion: "在生产环境中移除调试代码"
        });
      }
      
      // 检查是否缺少分号
      const jsLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('//') && 
        !line.trim().startsWith('/*') &&
        !line.trim().endsWith('{') &&
        !line.trim().endsWith('}')
      );
      
      jsLines.forEach((line, index) => {
        if (!line.trim().endsWith(';') && !line.trim().endsWith(',')) {
          if (line.includes('return') || line.includes('=') || line.includes('()')) {
            issues.push({
              type: "formatting",
              severity: "info",
              line: lines.indexOf(line) + 1,
              message: "可能缺少分号",
              suggestion: "建议在语句末尾添加分号"
            });
          }
        }
      });
    }
    
    if (language === 'python' || filename?.endsWith('.py')) {
      // Python 特定检查
      if (code.includes('import *')) {
        issues.push({
          type: "best-practice",
          severity: "warning",
          message: "避免使用 import *",
          suggestion: "明确导入需要的模块或函数"
        });
      }
    }
    
    // 通用代码质量检查
    if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK')) {
      issues.push({
        type: "maintenance",
        severity: "info",
        message: "发现待办事项标记",
        suggestion: "及时处理TODO、FIXME和HACK标记的代码"
      });
    }
    
    // 检查注释比例
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*')
    );
    
    const commentRatio = commentLines.length / nonEmptyLines.length;
    if (commentRatio < 0.1) {
      suggestions.push("建议增加代码注释，提高代码可读性");
    }
    
    // 计算复杂度指标
    const complexity = calculateComplexity(code);
    const maintainability = calculateMaintainability(code, issues.length);
    const readability = calculateReadability(code, commentRatio);
    
    return {
      issues,
      metrics: {
        complexity,
        maintainability,
        readability,
      },
      suggestions,
    };
  },
});

// 计算代码复杂度
function calculateComplexity(code: string): string {
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
  let complexityScore = 1; // 基础复杂度
  
  complexityKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexityScore += matches.length;
    }
  });
  
  if (complexityScore <= 5) return "低";
  if (complexityScore <= 10) return "中等";
  return "高";
}

// 计算可维护性
function calculateMaintainability(code: string, issueCount: number): string {
  const lines = code.split('\n').length;
  const score = Math.max(0, 100 - (lines / 10) - (issueCount * 5));
  
  if (score >= 80) return "优秀";
  if (score >= 60) return "良好";
  if (score >= 40) return "一般";
  return "需要改进";
}

// 计算可读性
function calculateReadability(code: string, commentRatio: number): string {
  const lines = code.split('\n');
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  
  let score = 100;
  if (avgLineLength > 80) score -= 20;
  if (commentRatio < 0.1) score -= 30;
  if (commentRatio > 0.3) score += 10;
  
  if (score >= 80) return "优秀";
  if (score >= 60) return "良好";
  if (score >= 40) return "一般";
  return "需要改进";
}
