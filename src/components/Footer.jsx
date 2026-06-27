function Footer() {
  const handleSocialClick = (platform) => {
    const urls = {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com'
    };
    window.open(urls[platform], '_blank');
  };

  return (
    <footer className="footer">
      <span className="footer-text">© 2026 PlannerAcadémico. Todos los derechos reservados.</span>
      <div className="social-links">
        <a href="#" className="social-link" onClick={(e) => { e.preventDefault(); handleSocialClick('facebook'); }}><i className="ti ti-brand-facebook"></i></a>
        <a href="#" className="social-link" onClick={(e) => { e.preventDefault(); handleSocialClick('instagram'); }}><i className="ti ti-brand-instagram"></i></a>
        <a href="#" className="social-link" onClick={(e) => { e.preventDefault(); handleSocialClick('twitter'); }}><i className="ti ti-brand-twitter"></i></a>
      </div>
    </footer>
  );
}

export default Footer;