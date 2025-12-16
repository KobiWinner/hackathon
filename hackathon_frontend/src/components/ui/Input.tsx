'use client';

import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
};

/**
 * Design system Input: label, helper/error metni ve addon alanları ile birlikte gelir.
 * A11y: aria-invalid ve aria-describedby bağlantılarını otomatik kurar.
 */
export function Input({
  label,
  description,
  error,
  leftAddon,
  rightAddon,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId, props["aria-describedby"]]
    .filter(Boolean)
    .join(" ")
    .trim() || undefined;

  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          className="flex items-center gap-1 text-sm font-semibold text-foreground"
          htmlFor={inputId}
        >
          <span>{label}</span>
          {required ? (
            <span aria-hidden className="text-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        className={cn(
          "group flex items-center rounded-lg border bg-white text-foreground shadow-inner shadow-primary/5",
          "focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/40",
          "transition-colors duration-150",
          invalid
            ? "border-danger/70 bg-danger/5 focus-within:ring-danger/60"
            : "border-border hover:border-primary/40",
          className,
        )}
      >
        {leftAddon ? (
          <span className="pl-3 pr-2 text-sm text-slate-500" aria-hidden>
            {leftAddon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            "w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400",
            "focus-visible:outline-none",
          )}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          required={required}
          {...props}
        />
        {rightAddon ? (
          <span className="pr-3 pl-2 text-sm text-slate-500" aria-hidden>
            {rightAddon}
          </span>
        ) : null}
      </div>

      {description && !error ? (
        <p
          id={descriptionId}
          className="text-xs text-slate-500"
        >
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
