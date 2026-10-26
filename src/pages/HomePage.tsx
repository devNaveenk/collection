import About from '../components/About'
import Catalog from '../components/Catalog'
import Hero from '../components/Hero'
import Infrastructure from '../components/Infrastructure'
import Overview from '../components/Overview'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Overview />
      <Catalog />
      <Infrastructure />
      <About />
    </>
  )
}
