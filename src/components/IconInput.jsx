import { inputBase } from '../lib/ui'

export default function IconInput({ icon: Icon, className = '', ...props }) {
  if (!Icon) {
    console.warn('IconInput: the "icon" prop is missing. Pass an icon from lucide-react.')
  }

  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      )}
      <input
        {...props}
        className={`${inputBase} ${Icon ? 'pl-11' : 'pl-3.5'} pr-3.5 ${className}`}
      />
    </div>
  )
}