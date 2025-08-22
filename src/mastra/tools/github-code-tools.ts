// import { createTool } from "@mastra/core/tools";
// import { z } from "zod";
// import { github } from "../integrations/github";

// export const getRepositoryFiles = createTool({
//   id: "get-repository-files",
//   description: "获取GitHub仓库的文件列表和内容",
//   inputSchema: z.object({
//     owner: z.string().describe("GitHub用户名或组织名"),
//     repo: z.string().describe("仓库名称"),
//     path: z.string().optional().describe("文件路径，默认为根目录"),
//     maxFiles: z.number().default(10).describe("最大返回文件数量"),
//   }),
//   outputSchema: z.object({
//     files: z.array(z.object({
//       name: z.string(),
//       path: z.string(),
//       type: z.string(),
//       content: z.string().optional(),
//       size: z.number().optional(),
//     })),
//     totalFiles: z.number(),
//   }),
//   execute: async ({ context }) => {
//     const client = await github.getApiClient();
    
//     try {
//       // 获取仓库内容
//       const response = await client.reposGetContent({
//         path: {
//           owner: context.owner,
//           repo: context.repo,
//           path: context.path || "",
//         },
//       });

//       const contents = Array.isArray(response.data) ? response.data : [response.data];
//       const files = [];
//       let processedFiles = 0;

//       for (const item of contents) {
//         if (processedFiles >= context.maxFiles) break;
        
//         if (item.type === "file" && isCodeFile(item.name)) {
//           try {
//             // 获取文件内容
//             const fileContent = await client.reposGetContent({
//               path: {
//                 owner: context.owner,
//                 repo: context.repo,
//                 path: item.path,
//               },
//             });

//             if (!Array.isArray(fileContent.data) && fileContent.data.content) {
//               files.push({
//                 name: item.name,
//                 path: item.path,
//                 type: item.type,
//                 content: Buffer.from(fileContent.data.content, 'base64').toString('utf-8'),
//                 size: item.size,
//               });
//               processedFiles++;
//             }
//           } catch (error) {
//             // 如果文件太大或其他错误，跳过
//             files.push({
//               name: item.name,
//               path: item.path,
//               type: item.type,
//               content: "文件太大或无法读取",
//               size: item.size,
//             });
//             processedFiles++;
//           }
//         } else if (item.type === "dir") {
//           files.push({
//             name: item.name,
//             path: item.path,
//             type: item.type,
//             size: 0,
//           });
//           processedFiles++;
//         }
//       }

//       return {
//         files,
//         totalFiles: contents.length,
//       };
//     } catch (error) {
//       throw new Error(`无法获取仓库内容: ${error instanceof Error ? error.message : '未知错误'}`);
//     }
//   },
// });

// export const getRepositoryInfo = createTool({
//   id: "get-repository-info",
//   description: "获取GitHub仓库的基本信息",
//   inputSchema: z.object({
//     owner: z.string().describe("GitHub用户名或组织名"),
//     repo: z.string().describe("仓库名称"),
//   }),
//   outputSchema: z.object({
//     name: z.string(),
//     description: z.string().nullable(),
//     language: z.string().nullable(),
//     stars: z.number(),
//     forks: z.number(),
//     issues: z.number(),
//     license: z.string().nullable(),
//     lastUpdate: z.string(),
//     size: z.number(),
//   }),
//   execute: async ({ context }) => {
//     const client = await github.getApiClient();
    
//     try {
//       const response = await client.reposGet({
//         path: {
//           owner: context.owner,
//           repo: context.repo,
//         },
//       });

//       const repo = response.data;
//       return {
//         name: repo.name,
//         description: repo.description,
//         language: repo.language,
//         stars: repo.stargazers_count,
//         forks: repo.forks_count,
//         issues: repo.open_issues_count,
//         license: repo.license?.name || null,
//         lastUpdate: repo.updated_at,
//         size: repo.size,
//       };
//     } catch (error) {
//       throw new Error(`无法获取仓库信息: ${error instanceof Error ? error.message : '未知错误'}`);
//     }
//   },
// });

// export const getPullRequestFiles = createTool({
//   id: "get-pull-request-files",
//   description: "获取Pull Request中的文件变更",
//   inputSchema: z.object({
//     owner: z.string().describe("GitHub用户名或组织名"),
//     repo: z.string().describe("仓库名称"),
//     pullNumber: z.number().describe("Pull Request编号"),
//   }),
//   outputSchema: z.object({
//     files: z.array(z.object({
//       filename: z.string(),
//       status: z.string(),
//       additions: z.number(),
//       deletions: z.number(),
//       changes: z.number(),
//       patch: z.string().optional(),
//     })),
//     totalFiles: z.number(),
//   }),
//   execute: async ({ context }) => {
//     const client = await github.getApiClient();
    
//     try {
//       const response = await client.pullsListFiles({
//         path: {
//           owner: context.owner,
//           repo: context.repo,
//           pull_number: context.pullNumber,
//         },
//       });

//       const files = response.data
//         .filter(file => isCodeFile(file.filename))
//         .map(file => ({
//           filename: file.filename,
//           status: file.status,
//           additions: file.additions,
//           deletions: file.deletions,
//           changes: file.changes,
//           patch: file.patch,
//         }));

//       return {
//         files,
//         totalFiles: files.length,
//       };
//     } catch (error) {
//       throw new Error(`无法获取PR文件: ${error instanceof Error ? error.message : '未知错误'}`);
//     }
//   },
// });

// // 工具函数：判断是否为代码文件
// function isCodeFile(filename: string): boolean {
//   const codeExtensions = [
//     '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php',
//     '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml',
//     '.vue', '.svelte', '.html', '.css', '.scss', '.sass', '.less',
//     '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.md', '.sql'
//   ];
  
//   return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
// }
