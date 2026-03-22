import { Link } from 'react-router-dom';

export default function Button({ 
  to, 
  href, 
  onClick, 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 px-6 py-3";
  
  const variants = {
    primary: "bg-gradient-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary/30",
    secondary: "bg-surface2 text-white border border-border hover:border-border-hover hover:bg-surface-hover",
    ghost: "text-text-muted hover:text-white hover:bg-surface2/50",
  };

  const finalClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={finalClasses} {...props}>{children}</Link>;
  }

  if (href) {
    return <a href={href} className={finalClasses} {...props}>{children}</a>;
  }

  return (
    <button onClick={onClick} className={finalClasses} {...props}>
      {children}
    </button>
  );
}
