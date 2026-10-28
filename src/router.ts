import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'debts'; filter?: string }
  | { name: 'debt'; id: string }
  | { name: 'add'; customerId?: string }
  | { name: 'customers' }
  | { name: 'customer'; id: string }
  | { name: 'settings' }
  | { name: 'plans' }
  | { name: 'privacy' }

// Hash routing keeps the phone's back button working with no server config.
export function parse(hash: string): Route {
  const [name = 'home', arg] = hash.replace(/^#\/?/, '').split('/')
  switch (name) {
    case 'debts':
      return { name: 'debts', filter: arg }
    case 'debt':
      return arg ? { name: 'debt', id: arg } : { name: 'debts' }
    case 'add':
      return { name: 'add', customerId: arg }
    case 'customers':
      return { name: 'customers' }
    case 'customer':
      return arg ? { name: 'customer', id: arg } : { name: 'customers' }
    case 'settings':
      return { name: 'settings' }
    case 'plans':
      return { name: 'plans' }
    case 'privacy':
      return { name: 'privacy' }
    default:
      return { name: 'home' }
  }
}

export function toHash(r: Route) {
  const arg = 'id' in r ? r.id : r.name === 'add' ? r.customerId : r.name === 'debts' ? r.filter : undefined
  return `#/${r.name}${arg ? '/' + arg : ''}`
}

export const go = (r: Route, replace = false) => {
  if (replace) location.replace(toHash(r))
  else location.hash = toHash(r)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parse(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
