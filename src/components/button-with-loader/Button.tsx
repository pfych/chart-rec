import React from 'react';
import styles from './button.module.scss';

interface Props {
  isLoading?: boolean;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  onClick?: () => void;
  children: JSX.Element | string;
}

const Button = (props: Props): JSX.Element => {
  const { isLoading, type, onClick, children, disabled } = props;
  return (
    <button
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
      className={styles.button}
    >
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
};

export default Button;
