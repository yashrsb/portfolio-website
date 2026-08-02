import { useState, useCallback } from 'react';

/**
 * useForm — lightweight form state + validation helper.
 *
 * @template T
 * @param {T} initialValues - Initial form values
 * @param {(values: T) => Partial<Record<keyof T, string>>} [validate] - Validator returning field errors
 * @returns {{
 *   values: T,
 *   errors: Partial<Record<keyof T, string>>,
 *   handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
 *   setValue: (name: keyof T, value: unknown) => void,
 *   handleSubmit: (onValid: (values: T) => void) => (event: React.FormEvent) => void,
 *   reset: () => void,
 *   setErrors: (errors: Partial<Record<keyof T, string>>) => void,
 *   isValid: boolean,
 * }}
 */
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(
    (onValid) => (event) => {
      event.preventDefault();
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
      }
      onValid(values);
    },
    [validate, values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    handleChange,
    setValue,
    handleSubmit,
    reset,
    setErrors,
    isValid,
  };
}

export { useForm };
export default useForm;
