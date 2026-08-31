import { profile } from "@/data/profile";

export function Approach() {
  return (
    <section className="section approach" id="approach">
      <div className="container">
        <div className="section-label"><span>02</span> Approach</div>
        <div className="approach-heading">
          <h2>From requirement to result.</h2>
          <p>A simple operating principle for solving complex implementation problems.</p>
        </div>
        <div className="approach-grid">
          {profile.focusAreas.map((item) => (
            <article className="approach-card" key={item.index}>
              <span className="card-index">{item.index}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="corner-arrow">↘</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
