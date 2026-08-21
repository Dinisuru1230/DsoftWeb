import { useEffect } from 'react';

/**
 * Reusable Confirmation Modal Component
 * Replaces window.confirm with a beautiful, accessible, responsive dialog.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  itemName = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon = null,
  loading = false,
  onConfirm,
  onClose,
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      iconBg: 'bg-error-container/30 text-error',
      badgeBg: 'bg-error-container/40 text-error',
      confirmBtn: 'bg-error hover:bg-error/85 text-white',
      defaultIcon: 'delete_forever',
    },
    warning: {
      iconBg: 'bg-tertiary-container/40 text-tertiary',
      badgeBg: 'bg-tertiary-container/50 text-tertiary',
      confirmBtn: 'bg-tertiary hover:bg-tertiary/90 text-on-tertiary',
      defaultIcon: 'warning',
    },
    primary: {
      iconBg: 'bg-primary-container text-primary',
      badgeBg: 'bg-primary-container/60 text-primary',
      confirmBtn: 'bg-primary hover:bg-primary/90 text-white',
      defaultIcon: 'help',
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.danger;
  const displayIcon = icon || currentVariant.defaultIcon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-md overflow-hidden transform transition-all animate-scale-up"
      >
        {/* Header / Content Area */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${currentVariant.iconBg}`}>
              <span className="material-symbols-outlined text-2xl">{displayIcon}</span>
            </div>
            <div className="flex-grow min-w-0">
              <h3 id="confirm-modal-title" className="font-title-sm text-lg text-on-surface font-bold">
                {title}
              </h3>
              {itemName && (
                <p className="font-label-md text-xs text-primary font-bold mt-0.5 truncate">
                  {itemName}
                </p>
              )}
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Description */}
          <div className="text-on-surface-variant font-body-md text-sm leading-relaxed">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-surface-container-low/50 px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-outline-variant rounded-full font-label-md text-xs sm:text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-full font-label-md text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2 font-bold shadow-sm ${currentVariant.confirmBtn}`}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">{displayIcon}</span>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
