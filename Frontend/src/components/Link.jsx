export default function Link({ to, children, className, ...props }) {
  return <a href={to} className={className} {...props} onClick={(event) => {
    props.onClick?.(event)
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, '', to)
    window.dispatchEvent(new Event('app:navigate'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }}>{children}</a>
}
