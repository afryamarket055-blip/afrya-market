function Button({ variant = 'primary', children, ...props }) {
  const className = `btn btn-${variant}`
  return (
    <button className={className} {...props}>
      {children}
    </button>
  )
}

export default Button
