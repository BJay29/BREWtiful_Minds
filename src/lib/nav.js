import { House, Heart, CalendarDays, User, Inbox, Star } from 'lucide-react'

export const customerNav = [
  { to: '/customer', label: 'Home', icon: House },
  { to: '/customer/favorites', label: 'Favorites', icon: Heart },
  { to: '/customer/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/customer/profile', label: 'Profile', icon: User },
]

export const baristaNav = [
  { to: '/barista', label: 'Home', icon: House },
  { to: '/barista/requests', label: 'Requests', icon: Inbox },
  { to: '/barista/reviews', label: 'Reviews', icon: Star },
  { to: '/barista/profile', label: 'Profile', icon: User },
]