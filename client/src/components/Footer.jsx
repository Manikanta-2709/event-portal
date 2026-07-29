const Footer = () => (
  <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-500">
      <p>© {new Date().getFullYear()} Eventra. All rights reserved.</p>
      <div className="flex gap-6">
        <span>Music</span>
        <span>Tech</span>
        <span>Sports</span>
        <span>Business</span>
      </div>
    </div>
  </footer>
);

export default Footer;
