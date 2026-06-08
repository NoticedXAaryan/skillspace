import styles from './EmptyState.module.css';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, actionText, actionHref, onAction, icon }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon || <PackageX size={32} className={styles.icon} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref} className={`btn btnPrimary ${styles.actionBtn}`}>
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className={`btn btnSecondary ${styles.actionBtn}`}>
          {actionText}
        </button>
      )}
    </div>
  );
}
