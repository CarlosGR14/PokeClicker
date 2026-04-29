import { ReactNode } from "react";
import styles from "./input-field.module.css";

interface InputFieldProps {
  id: string;
  name: string;
  type?: "text" | "email" | "password";
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  hint?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export default function InputField({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  error,
  hint,
  touched,
  onChange,
  onBlur,
  autoComplete,
  disabled,
  icon,
}: InputFieldProps) {
  const hasError = error && touched;

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`${styles.input} ${hasError ? styles.inputError : ""}`}
          aria-describedby={
            hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
      </div>
      {hasError && (
        <span className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
      {!hasError && hint && (
        <span className={styles.hint} id={`${id}-hint`}>
          ✓ {hint}
        </span>
      )}
    </div>
  );
}
