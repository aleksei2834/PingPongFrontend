import React from 'react';
import './button.css';

interface IButtonProps {
  children?: React.ReactNode;
  className: string;
  type: 'button' | 'reset' | 'submit';
  variant?: 'danger';

  onClick: () => void;
}

function Button(props: IButtonProps) {
  return (
    <button
      type={props.type}
      className={`button --${props.variant || ''} ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
export default Button;
