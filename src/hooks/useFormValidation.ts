import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseFormValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

interface UseFormValidation {
  [key: string]: UseFormValidationOptions;
}

interface UseFormOptions {
  validation?: UseFormValidation;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  resetOnSuccess?: boolean;
}

interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
}

interface FormState {
  [key: string]: FormField;
}

export function useFormValidation(
  initialValues: Record<string, any> = {},
  options: UseFormOptions = {}
) {
  const { validation = {}, onSuccess, onError, resetOnSuccess = false } = options;
  
  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Validate a single field
  const validateField = useCallback((name: string, value: any): string | null => {
    const fieldValidation = validation[name];
    if (!fieldValidation) return null;

    const { required, min, max, pattern, customValidator } = fieldValidation;

    // Required validation
    if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo es obligatorio';
    }

    // Skip other validations if field is empty and not required
    if (!value && !required) return null;

    // Min/Max validation for numbers
    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return `El valor debe ser mayor o igual a ${min}`;
      }
      if (max !== undefined && value > max) {
        return `El valor debe ser menor o igual a ${max}`;
      }
    }

    // Min/Max validation for strings (length)
    if (typeof value === 'string') {
      if (min !== undefined && value.length < min) {
        return `Debe tener al menos ${min} caracteres`;
      }
      if (max !== undefined && value.length > max) {
        return `No puede tener más de ${max} caracteres`;
      }
    }

    // Pattern validation
    if (pattern && typeof value === 'string' && !pattern.test(value)) {
      return 'El formato no es válido';
    }

    // Custom validation
    if (customValidator) {
      return customValidator(value);
    }

    return null;
  }, [validation]);

  // Update field value
  const updateField = useCallback((name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        value,
        error: null, // Clear error when user types
        touched: true
      }
    }));
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newState = { ...formState };

    Object.keys(newState).forEach(name => {
      const error = validateField(name, newState[name].value);
      newState[name].error = error;
      newState[name].touched = true;
      if (error) isValid = false;
    });

    setFormState(newState);
    return isValid;
  }, [formState, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isValid = validateForm();
      
      if (!isValid) {
        toast.error("Por favor corrige los errores en el formulario");
        return;
      }

      const values: Record<string, any> = {};
      Object.keys(formState).forEach(key => {
        values[key] = formState[key].value;
      });

      await onSubmit(values);
      
      if (onSuccess) {
        onSuccess(values);
      }

      if (resetOnSuccess) {
        reset();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, isSubmitting, validateForm, onSuccess, onError, resetOnSuccess]);

  // Reset form
  const reset = useCallback(() => {
    const newState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      newState[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      };
    });
    setFormState(newState);
  }, [initialValues]);

  // Get field props for form inputs
  const getFieldProps = useCallback((name: string) => {
    const field = formState[name] || { value: '', error: null, touched: false };
    
    return {
      value: field.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        updateField(name, e.target.value);
      },
      onBlur: () => {
        const error = validateField(name, field.value);
        setFormState(prev => ({
          ...prev,
          [name]: {
            ...prev[name],
            error,
            touched: true
          }
        }));
      },
      error: field.touched ? field.error : null,
      required: validation[name]?.required || false
    };
  }, [formState, updateField, validateField, validation]);

  // Get form values
  const values = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].value;
    return acc;
  }, {} as Record<string, any>);

  // Check if form has errors
  const hasErrors = Object.values(formState).some(field => field.error !== null);

  // Check if form is dirty (has been modified)
  const isDirty = Object.keys(formState).some(key => 
    formState[key].value !== initialValues[key]
  );

  return {
    values,
    formState,
    isSubmitting,
    hasErrors,
    isDirty,
    updateField,
    getFieldProps,
    handleSubmit,
    validateForm,
    reset,
    formRef
  };
}