import { predictionFormSchema, sportTypeOptions } from '@/app/lib/formschemas/predictionForm';
import { FormFieldProps } from '@/app/lib/interface';
import { useCallback } from 'react';
import BlogEditor from './BlogEditor';
import { OutputData } from '@editorjs/editorjs';
import { Controller } from 'react-hook-form';

export interface FormFieldPropsWithChange extends FormFieldProps {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  editorContent?: (data: OutputData | null) => void;
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

  const baseInputClasses = `mt-1 block w-full rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-orange-500 ${className} outline-none transition-colors focus:ring-1`;
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
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
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
            type="datetime-local"
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
