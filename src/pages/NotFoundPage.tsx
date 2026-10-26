import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Page not found</h1>
        <p className="section__lede">The page you requested does not exist.</p>
        <Link to="/" className="btn btn--primary">Back to home</Link>
      </div>
    </section>
  )
}
