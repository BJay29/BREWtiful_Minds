import { inputBase } from '../lib/ui'

export default function IconInput({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <input {...props} className={`${inputBase} pl-11 pr-3.5 ${className}`} />
    </div>
  )
}