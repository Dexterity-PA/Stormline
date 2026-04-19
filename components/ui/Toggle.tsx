'use client';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  'aria-label'?: string;
}

export function Toggle({ checked, onChange, label, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-fg transition-transform ${
            checked ? 'translate-x-[19px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  );
}
