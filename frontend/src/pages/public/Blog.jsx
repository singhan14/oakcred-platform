import GlassCard from '../../components/ui/GlassCard';
import GradientText from '../../components/ui/GradientText';
import Button from '../../components/ui/Button';

export default function Blog() {
  const categories = ["All", "AI & Technology", "Industry News", "Product Updates", "Thought Leadership"];
  
  const posts = [
    {
      title: "Optimizing Credit Approval Workflows with Alternative Data",
      category: "Thought Leadership",
      date: "Mar 18, 2026",
      excerpt: "How forward-thinking lenders are incorporating non-traditional metrics to safely expand their credit box to underserved markets.",
      image: "1"
    },
    {
      title: "Explaining the Unexplainable: Interpretability in AI Risk Models",
      category: "AI & Technology",
      date: "Mar 10, 2026",
      excerpt: "Regulators demand it. Customers expect it. Learn how OakCred achieves transparent ML decisions without sacrificing predictive accuracy.",
      image: "2"
    },
    {
      title: "OakCred 2.0: The Next Generation of Portfolio Monitoring",
      category: "Product Updates",
      date: "Feb 28, 2026",
      excerpt: "Introducing our real-time early warning system. Catch signs of borrower distress weeks before a delinquency occurs.",
      image: "3"
    },
    {
      title: "The Impact of Interest Rate Shifts on SME Lending",
      category: "Industry News",
      date: "Feb 15, 2026",
      excerpt: "Analyzing the macroeconomic trends reshaping the commercial credit landscape for the rest of the year.",
      image: "4"
    },
    {
      title: "Data Integrity: The Foundation of Reliable ML Modeling",
      category: "AI & Technology",
      date: "Feb 02, 2026",
      excerpt: "Garbage in, garbage out. A deep dive into the data orchestration pipelines powering modern assessment tools.",
      image: "5"
    },
    {
      title: "Case Study: How NexaBank Increased Approvals by 24%",
      category: "Thought Leadership",
      date: "Jan 18, 2026",
      excerpt: "A look at the transformative impact of switching from legacy scorecards to OakCred's dynamic risk engine.",
      image: "6"
    }
  ];

  return (
    <div className="w-full">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative pt-40 pb-16 px-6 max-w-4xl mx-auto text-center border-b border-border/50">
        <h1 className="text-5xl sm:text-7xl font-display font-bold text-white mb-6">
          OakCred <GradientText>Blog</GradientText>
        </h1>
        <p className="text-xl text-text-muted leading-relaxed">
          Insights, updates, and expert perspectives on the intersection of AI and credit intelligence.
        </p>
      </section>

      {/* ─── Featured Article ───────────────────────── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <GlassCard hoverEffect className="group cursor-pointer p-0 sm:p-0 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-64 md:h-auto bg-surface2 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-bg group-hover:scale-105 transition-transform duration-700"></div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-label tracking-widest font-bold mb-4 w-max">AI & TECHNOLOGY</span>
            <h2 className="text-3xl font-display font-bold text-white mb-4 group-hover:text-primary transition-colors">The Future of AI in Credit Assessment</h2>
            <p className="text-text-muted mb-6 leading-relaxed">
              Explore how generative AI and advanced neural networks are fundamentally reshaping the way financial institutions evaluate borrower risk, expanding financial inclusion while simultaneously minimizing default rates.
            </p>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Author" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Dr. Alan Turing</p>
                  <p className="text-text-subtle text-xs">Mar 22, 2026</p>
                </div>
              </div>
              <span className="text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">Read Article &rarr;</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ─── Blog Grid & Sidebar ────────────────────── */}
      <section className="py-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === 0 ? 'bg-surface2 text-white border border-border' : 'text-text-muted hover:text-white hover:bg-surface2/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <GlassCard key={i} hoverEffect className="group cursor-pointer p-5 flex flex-col">
                <div className="w-full h-48 rounded bg-surface2 mb-5 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105 ${i % 2 === 0 ? 'from-primary/10 to-bg' : 'from-bg to-primary/10'}`}></div>
                </div>
                <span className="text-xs font-label text-primary tracking-wider mb-3">{post.category}</span>
                <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-text-muted text-sm mb-6 flex-grow">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <p className="text-text-subtle text-xs">{post.date}</p>
                  <span className="text-primary font-medium text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">Read &rarr;</span>
                </div>
              </GlassCard>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="secondary" className="px-8">Load More Articles</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-8">
          {/* Newsletter Box */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-display font-bold text-white mb-2">Subscribe</h3>
            <p className="text-text-muted text-sm mb-6">Get the latest insights delivered weekly to your inbox.</p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Work email address" 
                className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Button variant="primary" className="w-full py-3">Subscribe</Button>
            </div>
          </GlassCard>
          
          {/* LinkedIn Box */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-display font-bold text-white mb-2">Connect</h3>
            <p className="text-text-muted text-sm mb-6">Join our professional community on LinkedIn.</p>
            <a 
              href="#" 
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">link</span>
              Follow OakCred
            </a>
          </GlassCard>
        </div>

      </section>
    </div>
  );
}
