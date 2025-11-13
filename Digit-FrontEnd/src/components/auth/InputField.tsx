import React from 'react';
import '../../styles/auth/InputField.css';

interface InputFieldProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  prefix?: string;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  name,
  placeholder,
  error,
  required = false,
  disabled = false,
  prefix,
  icon
}) => {
  return (
    <div className="input-field-container">
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <div className={`input-wrapper ${error ? 'error' : ''}`}>
        {icon && <div className="input-icon">{icon}</div>}
        {prefix && <div className="input-prefix">{prefix}</div>}
        <input
          className={`input-field ${prefix ? 'with-prefix' : ''} ${icon ? 'with-icon' : ''}`}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      </div>
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default InputField;
