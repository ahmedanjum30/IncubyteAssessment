'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Dialog({ open, onOpenChange, title, description, children, wide }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={`${styles.content} ${wide ? styles.wide : ''}`}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <span className={`${styles.reg} ${styles.tl}`} aria-hidden="true" />
          <span className={`${styles.reg} ${styles.br}`} aria-hidden="true" />
          <div className={styles.head}>
            <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
            <RadixDialog.Close className={styles.close} aria-label="Close">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </RadixDialog.Close>
          </div>
          {description ? (
            <RadixDialog.Description className={`muted ${styles.description}`}>
              {description}
            </RadixDialog.Description>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
