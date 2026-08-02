import React, { forwardRef } from 'react';
import { FiSearch } from 'react-icons/fi';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/20' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] resize-y ${
            error ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <Input
      leftIcon={<FiSearch className="w-4 h-4 text-cyan-400" />}
      placeholder="Search..."
      onChange={handleChange}
      {...props}
    />
  );
};
