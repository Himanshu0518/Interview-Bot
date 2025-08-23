import React, { useId } from 'react'

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    children, // Add children prop for select options
    ...props
}, ref) {
    const id = useId()
    
    return (
        <div className='w-full'>
            {label && (
                <label 
                    className='inline-block mb-1 pl-1 font-semibold' 
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            
            {type === "select" ? (
                <select
                    className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                    ref={ref}
                    {...props}
                    id={id}
                >
                    {children}
                </select>
            ) : (
                <input
                    type={type}
                    className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                    ref={ref}
                    {...props}
                    id={id}
                />
            )}
        </div>
    )
})

export default Input