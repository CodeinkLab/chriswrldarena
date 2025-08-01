import { predictionFormSchema, sportTypeOptions } from '@/app/lib/formschemas/predictionForm';
import { FormFieldProps } from '@/app/lib/interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import BlogEditor from './BlogEditor';
import { OutputData } from '@editorjs/editorjs';
import { Controller, FieldValues, UseFormRegister } from 'react-hook-form';

export interface FormFieldPropsWithChange extends FormFieldProps {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  editorContent?: (data: OutputData | null) => void;
}


// Accordion Select Component
interface AccordionSelectProps {
  name: string;
  register: UseFormRegister<FieldValues>;
  groupedOptions: Record<string, { label: string; value: string | number; country?: string }[]> | undefined;
  baseInputClasses: string;
  errorClasses: string;
  disabled: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
}

function AccordionSelect({
  name,
  register,
  groupedOptions,
  baseInputClasses,
  errorClasses,
  disabled,
  required,
  onChange,
  label,
}: AccordionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Auto-expand important groups by default
    const initialExpanded: Record<string, boolean> = {};
    if (groupedOptions) {
      Object.keys(groupedOptions).forEach(country => {
        if (['International', 'UEFA', 'England', 'Spain', 'Germany', 'Italy', 'France'].includes(country)) {
          initialExpanded[country] = true;
        }
      });
    }
    return initialExpanded;
  });
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(`Select ${label}`);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGroup = (country: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [country]: !prev[country]
    }));
  };

  const selectOption = (value: string | number, label: string) => {
    const stringValue = String(value);
    setSelectedValue(stringValue);
    setSelectedLabel(label);
    setIsOpen(false);

    // Trigger the onChange event for form registration
    if (onChange) {
      const event = {
        target: { value: stringValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  const sortedGroups = groupedOptions ? Object.entries(groupedOptions)
    /* .sort(([a], [b]) => {
      // Sort countries with 'International' and 'UEFA' first, then alphabetically
      if (a === 'International') return -1;
      if (b === 'International') return 1;
      if (a === 'UEFA') return -1;
      if (b === 'UEFA') return 1;
      if (a === 'Others') return 1;
      if (b === 'Others') return -1;
      return a.localeCompare(b);
} }*/ : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden input for form registration */}
      <input
        {...register(name)}
        type="hidden"
        value={selectedValue}
        required={required}
      />

      {/* Custom dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${baseInputClasses} ${errorClasses} px-4 py-2 text-left flex items-center justify-between w-full`}
      >
        <span className={selectedValue ? 'text-gray-900' : 'text-gray-500'}>
          {selectedLabel}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {sortedGroups.map(([country, countryOptions]) => (
            <div key={country} className="border-b border-gray-100 last:border-b-0">
              {/* Country header */}
              <button
                type="button"
                onClick={() => toggleGroup(country)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
              >
                <span>{country} ({countryOptions.length})</span>
                <svg
                  className={`w-4 h-4 transition-transform ${expandedGroups[country] ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Country options */}
              {expandedGroups[country] && (
                <div className="bg-white">
                  {countryOptions?.sort((a, b) => a.label.localeCompare(b.label)).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectOption(option.value, option.label)}
                      className={`w-full px-6 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600 ${selectedValue === option.value ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function FormField({
  type,
  name,
  label,
  register,
  hidden,
  error,
  required,
  options,
  placeholder,
  disabled = false,
  className = '',
  onChange,
  editorContent,
  control,
}: FormFieldPropsWithChange) {
  const getErrorMessage = useCallback((fieldName: string) => {
    const fieldError = error?.[fieldName];
    if (fieldError) {
      return fieldError.message as string;
    }
    return '';
  }, [error]);

  const baseInputClasses = `mt-1 block w-full rounded-lg border border-neutral-300 focus:border-green-500 focus:ring-green-500 ${className} outline-none transition-colors focus:ring-1`;
  const errorClasses = error?.[name] ? 'border-red-500' : '';

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses} px-4 py-2`}
            disabled={disabled}
            required={required}
            onChange={onChange}>
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'grouped-select':
        // Group options by country
        const groupedOptions = options?.reduce((acc, option) => {
          // Check if option has a country property (for leagues)
          if ('country' in option && option.country) {
            const country = option.country as string;
            if (!acc[country]) {
              acc[country] = [];
            }
            acc[country].push(option);
          } else {
            // Handle ungrouped options
            if (!acc['Other']) {
              acc['Other'] = [];
            }
            acc['Other'].push(option);
          }
          return acc;
        }, {} as Record<string, typeof options>);

        return <AccordionSelect
          name={name}
          register={register}
          groupedOptions={groupedOptions}
          baseInputClasses={baseInputClasses}
          errorClasses={errorClasses}
          disabled={disabled}
          required={required}
          onChange={onChange}
          label={label}
        />;



      case 'textarea':
        return (
          <textarea
            {...register(name)}
            placeholder={placeholder}
            className={`${baseInputClasses} ${errorClasses} px-4 py-2`}
            rows={8}
            disabled={disabled}
            required={required}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...register(name)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
            disabled={disabled}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step="any"
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
          />
        );
      case 'datetime-local':
        return (
          <input
            type="date"
            {...register(name)}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
          />
        );
      case 'editor':
        return control ? (
          <Controller
            name={name}
            control={control}
            defaultValue={null}
            render={({ field: { onChange, value } }) => (
              <BlogEditor onChange={onChange} blockvalue={value} />
            )}
          />
        ) : null;

      default:
        return (
          <input
            type={type}
            {...register(name)}
            placeholder={placeholder}
            className={`${baseInputClasses} ${errorClasses}  px-4 py-2`}
            disabled={disabled}
            required={required}
          />
        );
    }
  };

  return (
    <div className="flex w-full space-y-1">
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 ${hidden && "hidden"}`}>
          {label}
          {required && <span className={`text-red-500 ml-1`}>*</span>}
        </label>
        {renderField()}
        {error?.[name] && (
          <p className="text-red-500 text-xs mt-1">
            {getErrorMessage(name)}
          </p>
        )}
      </div>
    </div>
  );
}
