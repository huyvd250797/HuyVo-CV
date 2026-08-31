import { profile } from "@/data/profile";

export function Skills() {
  return (
    <section className="section skills" id="skills">
      <div className="container">
        <div className="section-label"><span>04</span> Skills</div>
        <div className="skills-heading">
          <h2>Capabilities built around real implementation work.</h2>
          <p>No arbitrary percentage bars — just the areas I use to understand, shape and deliver software solutions.</p>
        </div>
        <div className="skill-groups">
          {profile.skillGroups.map((group, groupIndex) => (
            <article className="skill-group" key={group.title}>
              <div className="skill-group-title"><span>0{groupIndex + 1}</span><h3>{group.title}</h3></div>
              <div className="skill-list">
                {group.skills.map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
