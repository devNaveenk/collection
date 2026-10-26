import { ArrowDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroGraphic from './HeroGraphic'

export default function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div>
          <p className="eyebrow eyebrow--light">Sonline</p>
          <h1 id="hero-title" className="hero__title">Technology powering connected workflows.</h1>
          <p className="hero__lede">
            Sonline builds and maintains a diverse portfolio of software products and digital platforms. Browse what is on
            record: each product's purpose, public website and source repository, where one has been provided.
          </p>
          <div className="hero__actions">
            <Link to="/#products" className="btn btn--accent">Explore Products <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/#overview" className="btn btn--ghost">View Portfolio <ArrowDown size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="false">
          <HeroGraphic />
        </div>
      </div>
    </section>
  )
}
