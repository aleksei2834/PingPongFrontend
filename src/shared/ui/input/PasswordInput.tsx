import { useState } from 'react';
import type { InputProps } from './Input';
import './input.css';

export function PasswordInput({
  className,
  iconLeft,
  iconRight,
  iconSwitch,
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-container">
      {iconLeft && <div className="input-icon-left">{iconLeft}</div>}
      <input className={className} {...props} type={show ? 'text' : 'password'} />
      {iconRight && (
        <button
          type="button"
          className="input-icon-password"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
        >
          {show ? iconSwitch : iconRight}
        </button>
      )}
    </div>
  );
}
