import './ConfigButton.css';

interface ConfigButtonProps {
  variant: 'trash' | 'regular' | 'accent';
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  type?: 'button' | 'submit';
  title?: string;
  disabled?: boolean;
  className?: string;
}

export const ConfigButton: React.FC<ConfigButtonProps> = ({ 
  variant, 
  onClick, 
  children,
  type = 'button',
  title,
  disabled = false,
  className = ''
}) => {
  const baseClass = 'conf-step__button';
  const variantClass = `conf-step__button-${variant}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      onClick={onClick}
      type={type}
      title={title}
      disabled={disabled} 
    >
      {children}
    </button>
  );
};