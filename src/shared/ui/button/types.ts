export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  width?: string | number;
  href?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}
