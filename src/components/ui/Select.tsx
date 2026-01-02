import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        { label, error, helperText, options, placeholder, className = '', id, ...props },
        ref
    ) => {
        const selectId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        {label}
                        {props.required && <span className="text-[#FF1493] ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={`
              w-full px-4 py-3 rounded-lg border bg-[#0A0A0A] text-white
              appearance-none cursor-pointer
              transition-all duration-200
              ${error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-700 focus:border-[#FF1493] focus:ring-[#FF1493]/20'
                            }
              focus:outline-none focus:ring-2
              disabled:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50
              ${!props.value ? 'text-gray-500' : ''}
              ${className}
            `}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={
                            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
                        }
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#1A1A1A] text-white">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p id={`${selectId}-error`} className="mt-1 text-sm text-red-400">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
