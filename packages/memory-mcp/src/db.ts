import Database from 'better-sqlite3';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';

const getDbPath = () => {
  const dir = path.join(os.homedir(), '.skillspace');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'memory.db');
};

const dbPath = getDbPath();
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    tags TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
    content,
    tags,
    content='memories',
    content_rowid='id'
  );

  -- Triggers to keep FTS index in sync
  CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
    INSERT INTO memories_fts(rowid, content, tags) VALUES (new.id, new.content, new.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content, tags) VALUES('delete', old.id, old.content, old.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content, tags) VALUES('delete', old.id, old.content, old.tags);
    INSERT INTO memories_fts(rowid, content, tags) VALUES (new.id, new.content, new.tags);
  END;
`);

export interface Memory {
  id: number;
  content: string;
  tags: string | null;
  timestamp: string;
}

export function saveMemory(content: string, tags: string[] = []): number {
  const stmt = db.prepare('INSERT INTO memories (content, tags) VALUES (?, ?)');
  const info = stmt.run(content, tags.join(','));
  return info.lastInsertRowid as number;
}

export function searchMemories(query: string, limit: number = 10): Memory[] {
  // If the query is empty, just return the most recent memories
  if (!query.trim()) {
    return db.prepare('SELECT * FROM memories ORDER BY timestamp DESC LIMIT ?').all(limit) as Memory[];
  }
  
  // Use FTS5 for keyword search. We'll wrap the query in quotes or handle basic FTS syntax.
  // A simple strategy is to just match words.
  const ftsQuery = query.replace(/['"]/g, '').split(/\s+/).filter(Boolean).map(w => `"${w}"*`).join(' OR ');
  if (!ftsQuery) return [];

  const stmt = db.prepare(`
    SELECT m.id, m.content, m.tags, m.timestamp 
    FROM memories_fts f 
    JOIN memories m ON f.rowid = m.id 
    WHERE memories_fts MATCH ? 
    ORDER BY rank 
    LIMIT ?
  `);
  
  return stmt.all(ftsQuery, limit) as Memory[];
}
