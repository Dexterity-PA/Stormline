'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';

export type FieldType = 'text' | 'select' | 'multiselect' | 'number' | 'bool';

export interface ProfileField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  helper?: string;
}

export interface DynamicProfileFormProps {
  fields: ProfileField[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  isPending: boolean;
}

export function DynamicProfileForm({
  fields,
  initialValues = {},
  onSubmit,
  isPending,
}: DynamicProfileFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const v = values[field.key];
        const isEmpty =
          v === undefined ||
          v === '' ||
          v === null ||
          (Array.isArray(v) && v.length === 0);
        if (isEmpty) newErrors[field.key] = `${field.label} is required`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fg">
            {field.label}
            {field.required && <span className="text-crit ml-1">*</span>}
          </label>
          {field.helper && <p className="text-xs text-fg-muted">{field.helper}</p>}
          <FieldInput
            field={field}
            value={values[field.key]}
            onChange={(v) => setValue(field.key, v)}
          />
          {errors[field.key] && (
            <p className="text-xs text-crit">{errors[field.key]}</p>
          )}
        </div>
      ))}
      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}

interface FieldInputProps {
  field: ProfileField;
  value: unknown;
  onChange: (v: unknown) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputClass =
    'bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent';

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
          className={`${inputClass} w-36`}
        />
      );

    case 'select': {
      const options = (field.options ?? []).map((o) => ({
        value: o,
        label: o.replace(/_/g, ' '),
      }));
      // Select.onChange is (value: string) => void — wrap to satisfy FieldInputProps
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onChange={(v: string) => onChange(v)}
          options={[{ value: '', label: '— select —' }, ...options]}
        />
      );
    }

    case 'multiselect': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked
                        ? selected.filter((x) => x !== opt)
                        : [...selected, opt],
                    )
                  }
                  className="accent-[var(--sl-accent)]"
                />
                <span className="text-sm text-fg">{opt.replace(/_/g, ' ')}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'bool':
      // Toggle.onChange is (checked: boolean) => void — wrap to satisfy FieldInputProps
      return (
        <Toggle
          checked={value === true}
          onChange={(checked: boolean) => onChange(checked)}
          label={value === true ? 'Yes' : 'No'}
        />
      );
  }
}
