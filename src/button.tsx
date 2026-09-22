import React from 'react';
import './button.css';

interface IButtonProps {
  children?: React.ReactNode;
  className: string;
  type: 'button' | 'reset' | 'submit';
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
}

function Button(props: IButtonProps) {
  return (
    <button
      type={props.type}
      className={`button ${props.className} ${props.size}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
export default Button;
