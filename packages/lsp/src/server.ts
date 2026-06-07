import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { parseDocument, YAMLParseError } from 'yaml';
import { SkillSchema, AgentSchema } from '@skillspace/schema';
import { ZodError } from 'zod';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    }
  };
  return result;
});

documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const uri = textDocument.uri;
  
  const diagnostics: Diagnostic[] = [];

  // Determine which schema to use based on filename
  let schemaToUse: any = null;
  if (uri.endsWith('skill.yaml')) {
    schemaToUse = SkillSchema;
  } else if (uri.endsWith('agent.yaml')) {
    schemaToUse = AgentSchema;
  }

  if (!schemaToUse) {
    // Clear diagnostics if it's not a known file type
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
    return;
  }

  try {
    const yamlDoc = parseDocument(text, { keepSourceTokens: true });
    
    // Check for YAML syntax errors
    if (yamlDoc.errors && yamlDoc.errors.length > 0) {
      yamlDoc.errors.forEach((err: YAMLParseError) => {
        const linePos = err.linePos;
        if (linePos) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: linePos[0].line - 1, character: linePos[0].col - 1 },
              end: { line: linePos[0].line - 1, character: linePos[0].col }
            },
            message: err.message,
            source: 'SkillSpace'
          });
        }
      });
      // Do not proceed to schema validation if YAML is malformed
      connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
      return;
    }

    const parsedJson = yamlDoc.toJSON();

    if (parsedJson === null || typeof parsedJson !== 'object') {
      connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
      return;
    }

    // Validate against Zod Schema
    const result = schemaToUse.safeParse(parsedJson);

    if (!result.success) {
      const zodError = result.error as ZodError;
      
      zodError.errors.forEach(issue => {
        const pathStr = issue.path.join('.');
        
        // Find the node in the YAML AST to report exact line numbers
        let nodeRange = { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } };
        
        try {
          const node = yamlDoc.getIn(issue.path, true) as any;
          if (node && node.range) {
            const startPos = textDocument.positionAt(node.range[0]);
            const endPos = textDocument.positionAt(node.range[1]);
            nodeRange = { start: startPos, end: endPos };
          } else {
            // fallback: check if we can get the parent node
            if (issue.path.length > 0) {
               const parentPath = issue.path.slice(0, -1);
               const parentNode = yamlDoc.getIn(parentPath, true) as any;
               if (parentNode && parentNode.range) {
                 const startPos = textDocument.positionAt(parentNode.range[0]);
                 const endPos = textDocument.positionAt(parentNode.range[1]);
                 nodeRange = { start: startPos, end: endPos };
               }
            }
          }
        } catch (e) {
          // fallback to beginning of file if AST parsing fails
        }

        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: nodeRange,
          message: (pathStr ? '[' + pathStr + ']: ' : '') + issue.message,
          source: 'SkillSpace'
        });
      });
    }

  } catch (error: any) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: error.message || 'Unknown validation error',
      source: 'SkillSpace'
    });
  }

  // Send the computed diagnostics to VSCode
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
