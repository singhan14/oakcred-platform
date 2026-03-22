export default function GradientText({ children, className = '', as: Component = 'span' }) {
  return (
    <Component className={`text-gradient ${className}`}>
      {children}
    </Component>
  );
}
