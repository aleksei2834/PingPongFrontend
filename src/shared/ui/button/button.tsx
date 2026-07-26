import React from 'react';
import styles from './button.module.css';
import type { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  icon,
  iconPosition = 'left',
  variant = 'primary',
  children,
  width,
  className = '',
  disabled = false,
  loading = false,
  style,
  href,
  type = 'button',
  onClick,
}) => {
  const variantClass = href ? styles.tertiary : styles[variant];

  const buttonStyle = {
    ...(width !== undefined ? { width } : {}),
    ...style,
  };

  const classNames = [styles.button, variantClass, loading && styles.loading, className]
    .filter(Boolean)
    .join(' ');

  const Component = href ? 'a' : 'button';

  const isDisabled = disabled;

  const componentProps = {
    className: classNames,
    style: buttonStyle,
    ...(href ? { href } : { disabled: isDisabled, type }),
    onClick,
  };

  return (
    <Component {...componentProps}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </Component>
  );
};
