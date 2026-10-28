import { useStore } from './store'
import { useRoute } from './router'
import { Home } from './screens/Home'
import { DebtDetail, Debts } from './screens/Debts'
import { AddDebt } from './screens/AddDebt'
import { CustomerDetail, Customers } from './screens/Customers'
import { Onboarding, Plans, Settings } from './screens/Settings'
import { Landing } from './screens/Landing'
import { Legal } from './screens/Legal'

export default function App() {
  const { settings } = useStore()
  const route = useRoute()

  if (route.name === 'legal') return <Legal page={route.page} />
  if (route.name === 'welcome') return <Landing />
  if (!settings.onboarded) return route.name === 'start' ? <Onboarding /> : <Landing />

  switch (route.name) {
    case 'debts':
      return <Debts filter={route.filter} />
    case 'debt':
      return <DebtDetail id={route.id} />
    case 'add':
      return <AddDebt customerId={route.customerId} />
    case 'customers':
      return <Customers />
    case 'customer':
      return <CustomerDetail id={route.id} />
    case 'settings':
      return <Settings />
    case 'plans':
      return <Plans />
    default:
      return <Home />
  }
}
