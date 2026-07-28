import { ArrowRight } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Footer({ setCurrentTab, onShowNotification }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const columns = [
    {
      title: 'Platform',
      items: [
        { label: 'Market', id: 'buy' },
        { label: 'Auctions', id: 'auctions' },
        { label: 'Sell Gold', id: 'sell' },
        { label: 'Pawn Loans', id: 'pawn' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About', id: 'about' },
        { label: 'Careers', id: 'about' },
        { label: 'Contact', id: 'resources' },
        { label: 'Press', id: 'about' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Help Center', id: 'resources' },
        { label: 'Documentation', id: 'resources' },
        { label: 'Blog', id: 'resources' },
        { label: 'Gold Prices', id: 'prices' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Terms of Service', id: 'about' },
        { label: 'Privacy Policy', id: 'about' },
        { label: 'Cookies', id: 'about' },
        { label: 'AML Compliance', id: 'about' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/[0.06] pt-16 pb-10 text-[#9CA3AF]">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        {/* Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-14 border-b border-white/[0.06]">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-7 w-7 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[#C8A45D]/20" />
                <span className="relative h-4 w-4 rounded-full bg-gradient-to-br from-[#E3C27A] to-[#8F6A32]" />
              </span>
              <span className="text-[16px] font-semibold text-white">OneGold</span>
            </div>
            <h3 className="text-[18px] font-semibold text-white">
              Join our newsletter for updates
            </h3>
            <p className="text-[14px] text-[#9CA3AF]">
              Spot alerts, auction previews, and platform news — delivered weekly.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onShowNotification?.('Newsletter subscription confirmed!', 'success');
            }}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 bg-[#111111] border border-white/10 focus:border-[#C8A45D]/50 focus:outline-none text-[14px] rounded-lg px-4 py-3 text-white placeholder-[#6B7280]"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center gap-1.5 bg-[#C8A45D] hover:bg-[#E3C27A] text-[#0A0A0A] text-[14px] font-semibold px-5 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Join <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14">
          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="text-[13px] font-semibold text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleLinkClick(item.id)}
                      className="text-[14px] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <p className="text-[13px] text-[#6B7280]">
            © {currentYear} OneGold. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['X', 'LinkedIn', 'Instagram'].map((social) => (
              <button
                key={social}
                className="text-[13px] text-[#6B7280] hover:text-white transition-colors cursor-pointer"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
