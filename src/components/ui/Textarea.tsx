import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    showCharCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            helperText,
            showCharCount = false,
            className = '',
            id,
            maxLength,
            value,
            ...props
        },
        ref
    ) => {
        const textareaId = id || props.name;
        const charCount = typeof value === 'string' ? value.length : 0;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        {label}
                        {props.required && <span className="text-[#FF1493] ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    value={value}
                    maxLength={maxLength}
                    className={`
            w-full px-4 py-3 rounded-lg border bg-[#0A0A0A] text-white
            placeholder:text-gray-600
            transition-all duration-200
            resize-none min-h-[120px]
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-700 focus:border-[#FF1493] focus:ring-[#FF1493]/20'
                        }
            focus:outline-none focus:ring-2
            disabled:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                        error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
                    }
                    {...props}
                />
                <div className="flex justify-between items-center mt-1">
                    {error ? (
                        <p id={`${textareaId}-error`} className="text-sm text-red-400">
                            {error}
                        </p>
                    ) : helperText ? (
                        <p id={`${textareaId}-helper`} className="text-sm text-gray-500">
                            {helperText}
                        </p>
                    ) : (
                        <span />
                    )}
                    {showCharCount && maxLength && (
                        <span
                            className={`text-sm ${charCount >= maxLength ? 'text-red-400' : 'text-gray-500'
                                }`}
                        >
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
