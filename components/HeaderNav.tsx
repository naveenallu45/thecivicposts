import Header from './Header'
import Navigation from './Navigation'
import AdminIndicator from './AdminIndicator'

export default function HeaderNav() {
  return (
    <div className="sticky top-0 z-50 bg-white">
      <AdminIndicator />
      <Header />
      <Navigation />
    </div>
  )
}
