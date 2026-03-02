import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'indigo';
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Added xl
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const baseStyles = "font-black uppercase border-black transition-none cursor-pointer select-none disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center";
    
    const variants = {
      primary: "bg-black text-white hover:bg-neutral-800 active:bg-white active:text-black",
      secondary: "bg-white text-black hover:bg-neutral-100 active:bg-black active:text-white",
      indigo: "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
    };

    const sizes = {
      sm: "text-[10px] px-3 py-1 border-2",
      md: "text-xs px-4 py-2 border-2",
      lg: "text-base px-6 py-3 border-[3px]",
      xl: "text-4xl py-8 px-10 border-4", // Handled the FIND MATCH scale here
    };

    const widthStyle = fullWidth ? "w-full" : "w-fit";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };