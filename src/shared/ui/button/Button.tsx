import './button.css';
import { type ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = 'button', children, ...props }: ButtonProps) {
  return (
    <button type={type} className={className ? `button ${className}` : 'button'} {...props}>
      {children}
    </button>
  );
}
