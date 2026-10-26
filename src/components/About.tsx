export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container about">
        <div>
          <p className="eyebrow">About Sonline</p>
          <h2 id="about-title" className="section__title">A portfolio of software products and digital platforms.</h2>
        </div>
        <div className="about__body">
          <p>
            Sonline develops and maintains a range of software products, demonstrations and supporting
            services. Its portfolio includes election technology, voter outreach, campaign finance tracking, customer
            support and AI-oriented applications, among others.
          </p>
          <p>
            This website brings those products together in one place so visitors can find each product's public website
            and, where one has been provided, its source repository.
          </p>
          <p className="muted">
            Further company information will be added here when it is officially supplied.
          </p>
        </div>
      </div>
    </section>
  )
}
