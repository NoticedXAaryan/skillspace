'use client';

import { motion } from 'framer-motion';
import { Database, Server, Terminal, Box, Cog, Network } from 'lucide-react';
import styles from './ArchitectureDiagram.module.css';

interface ArchitectureDiagramProps {
  type: 'full' | 'runtime' | 'workflow';
}

export default function ArchitectureDiagram({ type }: ArchitectureDiagramProps) {
  if (type === 'runtime') {
    return (
      <div className={styles.diagramWrapper}>
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.node} style={{ gridColumn: '2', gridRow: '1' }}>
            <Box className={styles.icon} />
            <span>Sandbox Environment</span>
          </div>
          
          <div className={styles.connectorVertical} style={{ gridColumn: '2', gridRow: '2' }}>
            <motion.div 
              className={styles.flowLine}
              animate={{ y: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </div>

          <div className={styles.node} style={{ gridColumn: '2', gridRow: '3', borderColor: 'var(--accent)' }}>
            <Cog className={styles.icon} style={{ color: 'var(--accent)' }} />
            <span>Execution Engine</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.diagramWrapper}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.node} style={{ gridColumn: '1', gridRow: '2' }}>
          <Terminal className={styles.icon} />
          <span>Developer CLI</span>
        </div>

        <div className={styles.connectorHorizontal} style={{ gridColumn: '2', gridRow: '2' }}>
          <motion.div 
            className={styles.flowLineRight}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        </div>

        <div className={styles.node} style={{ gridColumn: '3', gridRow: '2', borderColor: 'var(--accent)' }}>
          <Server className={styles.icon} style={{ color: 'var(--accent)' }} />
          <span>Global Registry</span>
        </div>

        <div className={styles.connectorHorizontal} style={{ gridColumn: '4', gridRow: '2' }}>
          <motion.div 
            className={styles.flowLineRight}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        </div>

        <div className={styles.node} style={{ gridColumn: '5', gridRow: '2' }}>
          <Database className={styles.icon} />
          <span>Neon Postgres</span>
        </div>
      </motion.div>
    </div>
  );
}
