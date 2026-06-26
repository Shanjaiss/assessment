import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, testId = 'modal' }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      onClick={onClose}
      data-testid={`${testId}-overlay`}
    >
      <div
        className='bg-surface border-2 border-ink p-8 max-w-lg w-full rounded-sm shadow-brutLg max-h-[90vh] overflow-y-auto animate-fade-in'
        onClick={(e) => e.stopPropagation()}
        data-testid={testId}
      >
        <div className='flex items-start justify-between mb-6'>
          <h3 className='font-head font-bold text-2xl text-ink h-mark'>
            {title}
          </h3>
          <button
            onClick={onClose}
            className='text-muted hover:text-ink p-1'
            aria-label='Close'
            data-testid={`${testId}-close-btn`}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
