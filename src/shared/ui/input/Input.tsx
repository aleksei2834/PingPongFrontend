import React from 'react';
import './input.css';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconSwitch?: React.ReactNode;
};
export function Input({ className, iconLeft, iconRight, ...props }: InputProps) {
  return (
    <div className="input-container">
      {iconLeft && <div className="input-icon-left">{iconLeft}</div>}
      <input className={className} {...props} />
      {iconRight && <div className="input-icon-right">{iconRight}</div>}
    </div>
  );
}
