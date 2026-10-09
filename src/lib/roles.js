export function homeFor(role) {
  return role === 'barista' ? '/barista' : '/customer'
}