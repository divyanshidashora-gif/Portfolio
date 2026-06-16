import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="portfolio">
      {/* Progress Bar */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#" className="nav-logo">Divyanshi</a>
          <ul className="nav-menu">
  <li><a href="#tools" className="nav-link">Tools</a></li>
  <li><a href="#work" className="nav-link">Work</a></li>
  <li><a href="#about" className="nav-link">About</a></li>
  <li><a href="#contact" className="nav-link">Contact</a></li>
</ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="section hero-section">
        <div className="section-number">01 / 06</div>
        <div className="hero-image">
  <img src="/profile.jpg" alt="Divyanshi" />
</div>
        <div className="hero-wrapper">
          <div className="hero-content fade-in-up">
            <h1 className="hero-title">
              Digital Creative <span className="accent">Powered</span> by Code
            </h1>
            <p className="hero-subtitle">
              Frontend Developer & Translator crafting beautiful, high-converting digital experiences
            </p>
            <div className="cta-group">
              <a href="#work" className="btn btn-primary">View Work</a>
              <a href="#contact" className="btn btn-secondary">Get in Touch</a>
            </div>
          </div>
        </div>
      </section>
      {/* Tools Section */}
<section id="tools" className="section tools-section">
  <div className="section-number">02 / 06</div>

  <div className="container">
    <div className="work-header fade-in-up">
      <h2 className="section-title">Useful Tools</h2>
      <p className="section-subtitle">
        Productivity tools built for everyday users
      </p>
    </div>

    <div className="work-grid">

      <div className="work-card fade-in-up">
        <div className="work-image">📄</div>

        <h3>Resume Builder</h3>

        <p>
          Create professional resumes with live preview
          and PDF download functionality.
        </p>
        

        <div className="work-tags">
          <span>React</span>
          <span>PDF</span>
          <span>Forms</span>
        </div>

        <a href="/resume-builder" className="work-link">
          Open Tool →
        </a>
      </div>

    </div>
  </div>
</section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="section-number">03 / 06</div>
        <div className="container">
          <div className="about-wrapper fade-in-up">
            <div className="about-header">
              <h2 className="section-title">The Why</h2>
              <p className="section-subtitle">
                I build web experiences that don't just look beautiful—they perform like athletes at the Olympics.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-card">
                <h3>Frontend Mastery</h3>
                <p>Crafting responsive, high-performance web applications with React, JavaScript, and modern CSS that convert visitors into customers.</p>
              </div>
              <div className="about-card">
                <h3>Translation & Localization</h3>
                <p>Breaking language barriers through professional translation and cultural adaptation for global audiences.</p>
              </div>
              <div className="about-card">
                <h3>User-Centric Design</h3>
                <p>Every pixel serves a purpose. Every interaction matters. Every detail drives results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="section work-section">
        <div className="section-number">04 / 06</div>
        <div className="container">
          <div className="work-header fade-in-up">
            <h2 className="section-title">Featured Work</h2>
            <p className="section-subtitle">Projects that make clients weak in the knees</p>
          </div>

          <div className="work-grid">
            <div className="work-card fade-in-up">
              <div className="work-image">💻</div>
              <h3>Portfolio Website</h3>
              <p>Modern portfolio built with React and Vite, featuring smooth animations and responsive design</p>
              <div className="work-tags">
                <span>React</span>
                <span>CSS3</span>
                <span>Animations</span>
              </div>
              <a href="#" className="work-link">View Project →</a>
            </div>

            <div className="work-card fade-in-up">
              <div className="work-image">📱</div>
              <h3>E-Commerce Platform</h3>
              <p>Full-featured e-commerce solution with cart functionality and smooth checkout experience</p>
              <div className="work-tags">
                <span>React</span>
                <span>JavaScript</span>
                <span>UX/UI</span>
              </div>
              <a href="#" className="work-link">View Project →</a>
            </div>

            <div className="work-card fade-in-up">
              <div className="work-image">🎨</div>
              <h3>Interactive Dashboard</h3>
              <p>Real-time data visualization dashboard with interactive charts and responsive layout</p>
              <div className="work-tags">
                <span>React</span>
                <span>Data Viz</span>
                <span>Performance</span>
              </div>
              <a href="#" className="work-link">View Project →</a>
            </div>

            <div className="work-card fade-in-up">
              <div className="work-image">
  <img src="/portfolio-project.jpg" alt="Project" />
</div>
              <h3>Translation Portal</h3>
              <p>Web application for managing translation projects with multi-language support and collaboration</p>
              <div className="work-tags">
                <span>React</span>
                <span>i18n</span>
                <span>Backend</span>
              </div>
              <a href="#" className="work-link">View Project →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section skills-section">
        <div className="section-number">05 / 06</div>
        <div className="container">
          <div className="skills-header fade-in-up">
            <h2 className="section-title">Arsenal</h2>
            <p className="section-subtitle">The tools and technologies that power my work</p>
          </div>

          <div className="skills-wrapper">
            <div className="skill-group fade-in-up">
              <h3>Frontend</h3>
              <div className="skill-items">
                <div className="skill-item">React</div>
                <div className="skill-item">JavaScript</div>
                <div className="skill-item">HTML5</div>
                <div className="skill-item">CSS3</div>
              </div>
            </div>

            <div className="skill-group fade-in-up">
              <h3>Tools</h3>
              <div className="skill-items">
                <div className="skill-item">VS Code</div>
                <div className="skill-item">GitHub</div>
                <div className="skill-item">Vite</div>
                <div className="skill-item">Git</div>
              </div>
            </div>

            <div className="skill-group fade-in-up">
              <h3>Services</h3>
              <div className="skill-items">
                <div className="skill-item">Translation</div>
                <div className="skill-item">Localization</div>
                <div className="skill-item">Documentation</div>
                <div className="skill-item">QA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="section-number">06 / 06</div>
        <div className="container">
          <div className="contact-wrapper fade-in-up">
            <h2 className="section-title">Let's Talk</h2>
            <p className="section-subtitle">Got a project? Let's build something extraordinary together</p>
            
            <div className="contact-content">
              <form className="contact-form">
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Tell me about your project" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-large">Send Message</button>
              </form>

              <div className="contact-info">
                <div className="info-item">
                  <h4>Email</h4>
                  <a href="mailto:divyanshidashora@gmail.com">divyanshidashora@gmail.com</a>
                </div>
                <div className="info-item">
                  <h4>LinkedIn</h4>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">linkedin.com/in/divyanshi</a>
                </div>
                <div className="info-item">
                  <h4>GitHub</h4>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com/divyanshi</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Divyanshi Dashora. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
