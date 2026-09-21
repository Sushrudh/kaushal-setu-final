import React, { useState, useEffect } from 'react';

interface TermsOfServiceViewProps {
  onNavigate?: (view: string) => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.history.back();
    }
  };

  const clauses = [
    {
      id: 'sec-1',
      num: '1',
      title: 'Eligibility',
      icon: 'person_outline',
      keywords: 'eligibility account age authority entity institution company student',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>You must provide accurate and complete information when creating or using an account.</p>
          <p>If you are using Kaushal Setu on behalf of an educational institution, company, organization, or other entity, you confirm that you have the authority to act on behalf of that entity.</p>
          <p>Users under the applicable age of majority should use the platform only with the involvement and consent of a parent, guardian, educational institution, or other authorized person where required by applicable law.</p>
        </div>
      )
    },
    {
      id: 'sec-2',
      num: '2',
      title: 'Our Services',
      icon: 'hub',
      keywords: 'services features student profiles networking skill opportunities internships jobs projects mentorship',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Kaushal Setu may provide services and features including, but not limited to:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              { icon: 'badge', text: 'Student and professional profiles.' },
              { icon: 'hub', text: 'Academic and industry networking.' },
              { icon: 'school', text: 'Skill-development and learning opportunities.' },
              { icon: 'work', text: 'Internships, jobs, projects, or other career-related opportunities.' },
              { icon: 'corporate_fare', text: 'Connections between educational institutions and industry organizations.' },
              { icon: 'event', text: 'Events, workshops, training, mentorship, or collaboration opportunities.' },
              { icon: 'forum', text: 'Communication and networking features.' },
              { icon: 'auto_awesome', text: 'Other features that may be introduced or modified from time to time.' }
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#00236f] text-[18px] shrink-0 mt-0.5">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-slate-900 font-semibold text-xs">We reserve the right to modify, suspend, discontinue, or replace any feature or service at any time.</p>
        </div>
      )
    },
    {
      id: 'sec-3',
      num: '3',
      title: 'User Accounts',
      icon: 'manage_accounts',
      keywords: 'user accounts login credentials password security student institution employer',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Certain features may require you to create an account.</p>
          <p className="font-bold text-slate-900">You are responsible for:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'Providing truthful and current information.',
              'Maintaining the confidentiality of your login credentials.',
              'Keeping your account secure.',
              'All activities carried out through your account.',
              'Informing us promptly if you believe your account has been accessed without authorization.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 mt-1">
            <p className="text-xs font-medium">You must not create an account using another person's identity or provide misleading information about your qualifications, organization, education, employment, or experience.</p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-4',
      num: '4',
      title: 'User Content',
      icon: 'article',
      keywords: 'user content ownership resume documents projects posts license intellectual property',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Users may submit or publish information such as profiles, resumes, photographs, educational information, professional information, posts, projects, documents, applications, messages, and other materials (“User Content”).</p>
          <p className="font-bold text-slate-900">You retain ownership of your User Content.</p>
          <p>By submitting User Content to Kaushal Setu, you grant us a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, process, and distribute that content as reasonably necessary to operate, maintain, improve, and provide the platform and its services.</p>
          <p>You are responsible for ensuring that you have the necessary rights and permissions to submit any User Content.</p>
        </div>
      )
    },
    {
      id: 'sec-5',
      num: '5',
      title: 'Accuracy of Information',
      icon: 'fact_check',
      keywords: 'accuracy information verification credentials employment compensation internships third party',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Kaushal Setu may contain information provided by users, educational institutions, employers, organizations, or other third parties.</p>
          <p>We do not guarantee that all information available through the platform is accurate, complete, current, or suitable for your particular purpose.</p>
          <p>Users should independently verify important information, including employment opportunities, educational credentials, job descriptions, compensation, internships, projects, certifications, and representations made by other users or organizations.</p>
        </div>
      )
    },
    {
      id: 'sec-6',
      num: '6',
      title: 'Jobs, Internships, Projects and Opportunities',
      icon: 'work_outline',
      keywords: 'jobs internships projects opportunities employer recruiter contracts selections student employer',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Kaushal Setu may display or facilitate access to employment, internship, project, training, mentorship, or other opportunities.</p>
          <p>Kaushal Setu is not necessarily the employer, recruiter, educational institution, or contracting party for such opportunities.</p>
          <p>Any agreement entered into between a user and an employer, institution, organization, or other third party is between those parties unless Kaushal Setu expressly states otherwise.</p>
          <p className="font-bold text-slate-900 pt-1">We do not guarantee that:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'An opportunity will remain available.',
              'A user will be selected.',
              'An employer or organization will make an offer.',
              'Information provided by a third party is accurate.',
              'A particular opportunity will result in employment, admission, compensation, or any other outcome.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">radio_button_unchecked</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'sec-7',
      num: '7',
      title: 'Acceptable Use',
      icon: 'rule',
      keywords: 'acceptable use violations restrictions malware fraud impersonation scraping spam security',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p className="font-bold text-rose-600">You agree not to use Kaushal Setu to:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'Violate any applicable law or regulation.',
              'Impersonate another person or organization.',
              'Provide false, misleading, or fraudulent information.',
              'Harass, threaten, abuse, or intimidate other users.',
              'Upload malware, viruses, or other harmful code.',
              'Attempt to gain unauthorized access to accounts, systems, or data.',
              'Scrape, copy, reproduce, or commercially exploit platform content without authorization.',
              'Send spam or unauthorized promotional communications.',
              'Collect personal information about other users without appropriate authorization.',
              'Post content that infringes intellectual-property or other legal rights.',
              'Use the platform for fraudulent recruitment, scams, phishing, or other deceptive activities.',
              'Interfere with the operation or security of the platform.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">block</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-slate-900">We may investigate suspected violations and take appropriate action, including removing content, restricting access, suspending accounts, or terminating accounts.</p>
        </div>
      )
    },
    {
      id: 'sec-8',
      num: '8',
      title: 'Intellectual Property',
      icon: 'copyright',
      keywords: 'intellectual property ip proprietary copyright software trademarks branding logos',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>The Kaushal Setu website, including its software, design, branding, logos, graphics, text, interfaces, and other original materials, is owned by or licensed to Kaushal Setu unless otherwise stated.</p>
          <p>You may not copy, reproduce, modify, distribute, sell, license, reverse engineer, or commercially exploit our proprietary materials without prior written permission, except where permitted by applicable law.</p>
          <p>Nothing in these Terms transfers ownership of Kaushal Setu's intellectual property to you.</p>
        </div>
      )
    },
    {
      id: 'sec-9',
      num: '9',
      title: 'Third-Party Services and Links',
      icon: 'link',
      keywords: 'third party services links integrations external websites',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>The platform may contain links to or integrations with third-party websites, services, organizations, or applications.</p>
          <p>Third-party services are governed by their own terms and policies. Kaushal Setu is not responsible for the content, security, availability, or practices of third-party services.</p>
          <p>You should review the applicable terms and privacy policies before using third-party services.</p>
        </div>
      )
    },
    {
      id: 'sec-10',
      num: '10',
      title: 'Privacy',
      icon: 'lock',
      keywords: 'privacy data personal information policy data protection',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1">
            <span className="font-medium text-slate-900">Data Governance Framework</span>
            <button
              onClick={() => onNavigate ? onNavigate('privacy-policy') : null}
              className="text-[#ea580c] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Read Full Policy</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <p>Your use of Kaushal Setu may involve the collection and processing of personal information.</p>
          <p>Our handling of personal information is governed by our applicable Privacy Policy, which should be read together with these Terms.</p>
          <p>By using the platform, you acknowledge that information may be processed as necessary to provide and improve the services, subject to applicable law and our Privacy Policy.</p>
          <div className="mt-1 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
            <span className="text-xs text-slate-700">Access our full data governance guidelines</span>
            <button
              onClick={() => onNavigate ? onNavigate('privacy-policy') : null}
              className="text-xs text-[#00236f] font-bold hover:underline cursor-pointer"
            >
              Privacy Policy →
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'sec-11',
      num: '11',
      title: 'Communications',
      icon: 'chat',
      keywords: 'communications alerts notifications messages marketing email',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>By using the platform, you may receive service-related communications, including account notifications, security alerts, updates, and messages relating to your use of the platform.</p>
          <p>Where required by applicable law, marketing communications will be subject to appropriate consent and available opt-out mechanisms.</p>
        </div>
      )
    },
    {
      id: 'sec-12',
      num: '12',
      title: 'Payments and Fees',
      icon: 'payments',
      keywords: 'payments fees subscriptions pricing taxes refunds cancellations',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>If Kaushal Setu introduces paid services, subscriptions, registrations, or other fees, the applicable price and payment terms will be presented before you complete the relevant transaction.</p>
          <p className="font-bold text-slate-900">Unless otherwise stated:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'Fees must be paid through the payment method made available by Kaushal Setu.',
              'Applicable taxes may be added where required.',
              'Refunds, cancellations, and subscription terms will be governed by the applicable terms presented at the time of purchase.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00236f] text-[18px] shrink-0">check</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'sec-13',
      num: '13',
      title: 'Disclaimers',
      icon: 'info',
      keywords: 'disclaimers warranty as is availability uninterrupted accuracy outcomes',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Kaushal Setu is provided on an “as is” and “as available” basis to the extent permitted by applicable law.</p>
          <p className="font-bold text-slate-900">We do not guarantee that:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'The platform will always be available or uninterrupted.',
              'The platform will be error-free or completely secure.',
              'All information will be accurate or current.',
              'The platform will meet every user\'s particular requirements.',
              'Any job, internship, training, academic, professional, or business outcome will result from using the platform.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">info</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1">Nothing in these Terms excludes or limits any rights or protections that cannot legally be excluded under applicable law.</p>
        </div>
      )
    },
    {
      id: 'sec-14',
      num: '14',
      title: 'Limitation of Liability',
      icon: 'shield',
      keywords: 'liability limitation damages indirect consequential losses',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>To the maximum extent permitted by applicable law, Kaushal Setu and its owners, operators, employees, affiliates, and service providers will not be liable for indirect, incidental, consequential, special, or punitive losses arising from your use of, or inability to use, the platform.</p>
          <p>This includes, where legally permissible, losses arising from reliance on information provided by users or third parties, interactions between users, third-party services, or opportunities listed on the platform.</p>
          <p>Nothing in these Terms limits liability that cannot legally be limited or excluded.</p>
        </div>
      )
    },
    {
      id: 'sec-15',
      num: '15',
      title: 'User Disputes',
      icon: 'gavel',
      keywords: 'user disputes interactions complaints verification caution',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>Users are responsible for their interactions and dealings with other users, employers, educational institutions, organizations, and other third parties.</p>
          <p>Kaushal Setu may, but is not obligated to, assist with disputes or investigate complaints.</p>
          <p>Users should exercise appropriate caution and conduct their own verification before entering into agreements or sharing sensitive information.</p>
        </div>
      )
    },
    {
      id: 'sec-16',
      num: '16',
      title: 'Suspension and Termination',
      icon: 'warning',
      keywords: 'suspension termination breach violation security fraud risk account closing',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>We may suspend, restrict, or terminate access to the platform where we reasonably believe that:</p>
          <ul className="flex flex-col gap-1.5 pl-1">
            {[
              'These Terms have been violated.',
              'Applicable law has been violated.',
              'The account presents a security or fraud risk.',
              'The user\'s conduct may harm other users or the platform.',
              'Continued access is otherwise inappropriate or unlawful.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c] text-[18px] shrink-0">warning</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1">You may stop using the platform at any time.</p>
          <p>Certain provisions of these Terms, including provisions concerning intellectual property, disclaimers, limitations of liability, disputes, and applicable law, may continue to apply after termination where legally applicable.</p>
        </div>
      )
    },
    {
      id: 'sec-17',
      num: '17',
      title: 'Changes to These Terms',
      icon: 'update',
      keywords: 'changes terms updates revised amendments notification',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>We may update these Terms from time to time.</p>
          <p>When changes are made, we may update the “Last Updated” date and, where appropriate, provide additional notice.</p>
          <p>Your continued use of Kaushal Setu after updated Terms become effective constitutes acceptance of the revised Terms, to the extent permitted by applicable law.</p>
        </div>
      )
    },
    {
      id: 'sec-18',
      num: '18',
      title: 'Governing Law',
      icon: 'gavel',
      keywords: 'governing law jurisdiction dispute resolution courts legal entity',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>These Terms shall be governed by and interpreted in accordance with the laws applicable to the jurisdiction in which the Kaushal Setu operating entity is established, without regard to conflict-of-law principles.</p>
          <p>Any disputes shall be subject to the jurisdiction of the courts or dispute-resolution mechanisms applicable under such law.</p>
          <div className="p-3 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            <p className="text-xs text-slate-600">
              <strong className="text-slate-900 font-bold">Important:</strong> The final governing-law and jurisdiction clause should be reviewed and completed with the actual legal entity's registered location before publication.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sec-19',
      num: '19',
      title: 'Severability',
      icon: 'content_cut',
      keywords: 'severability invalid unenforceable provisions remainder',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision shall be interpreted or modified to the extent necessary to make it enforceable, and the remaining provisions will continue in effect.</p>
        </div>
      )
    },
    {
      id: 'sec-20',
      num: '20',
      title: 'Entire Agreement',
      icon: 'handshake',
      keywords: 'entire agreement understanding policies contract',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>These Terms, together with any applicable policies or additional terms referenced on the platform, constitute the agreement between you and Kaushal Setu concerning your use of the platform, except where a separate written agreement applies.</p>
        </div>
      )
    },
    {
      id: 'sec-21',
      num: '21',
      title: 'Contact Us',
      icon: 'contact_support',
      keywords: 'contact support questions complaints helpdesk inquiries',
      content: (
        <div className="text-sm text-slate-600 flex flex-col gap-2">
          <p>If you have questions, concerns, complaints, or requests regarding these Terms or the Kaushal Setu platform, please contact us through the contact information provided on the website.</p>
          <div className="mt-2 p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1.5">
            <span className="text-base font-bold text-[#00236f]">Kaushal Setu</span>
            <div className="flex items-center gap-2 text-slate-800 text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#00236f]">language</span>
              <span className="font-bold">Website:</span>
              <a
                className="text-[#00236f] hover:underline truncate"
                href="https://kaushal-setu-final.onrender.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                https://kaushal-setu-final.onrender.com/
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Note: Contact official national support desk at support@kaushalsetu.in for statutory queries and institutional agreements.
            </p>
          </div>
        </div>
      )
    }
  ];

  const filteredClauses = clauses.filter(c => {
    const q = (searchQuery || roleFilter).toLowerCase().trim();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.keywords.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#f8f9ff] font-sans text-slate-800 flex flex-col min-h-screen">
      {/* Institutional Top Strip & Main Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200">
        <div className="w-full bg-[#0F172A] text-white px-4 sm:px-8 py-1 text-[11px] flex items-center justify-between font-sans">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-[#FF9933]">account_balance</span>
            <span className="font-medium tracking-wide uppercase">National Academia-Industry Collaborative Network • Higher Education &amp; Skill Development</span>
          </div>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Doc ID: KS-LEGAL-TOS-2026</span>
        </div>

        <div className="h-16 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1VIaBvfJLYD4KZs626frH2achYUpXlLeD4vZG0r8q2-vpHQ-CKRCY8-a-RPYHK_oMQ4EteuRmALnbxkCmWryNmAgLUGgr-ieq1wbD1rzrD1gtVKwz3Y-S_pj6i_eyLEhXIsqAI40IbXJ7GVCwne96qc8t2Z1ieOMqLmwDtuTAlbRl59r6LwtJDClBEz2Paqlf9DV_c2aeMC-4KN64RA3Bx-GdbL7RCwsfKMzI51zul7qLILcc2MXI3gl0Vc"
                alt="Kaushal Setu Official Logo"
                className="h-10 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="flex flex-col min-w-0 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#00236f] font-semibold uppercase tracking-wider">Terms of Service</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">V3 Verified</span>
                </div>
                <h1 className="text-sm sm:text-base text-slate-900 truncate font-bold">Institutional &amp; User Agreement</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[11px] font-semibold text-[#00236f]">Govt &amp; Institutional Compliance</span>
              <span className="text-[10px] text-slate-500">AICTE &amp; Skill India Aligned</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#00236f] text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[13px]">verified</span> Official
            </span>
          </div>
        </div>

        {/* Tricolour Accent Line */}
        <div className="h-[3px] w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-28 pb-safe px-4 sm:px-8 max-w-5xl mx-auto bg-[#f8f9ff]">
        <div className="flex flex-col w-full pb-12">
          {/* Top Identity Breadcrumb & Back Action */}
          <div className="flex items-center justify-between py-3 flex-wrap gap-2">
            <button
              onClick={() => onNavigate ? onNavigate('login') : handleBack()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[#00236f] text-xs font-semibold shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Return to Auth / Login</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">gavel</span>
                <span>AICTE &amp; National Education Policy Compliant</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-xs hidden sm:inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified_user</span> Legally Binding
              </span>
            </div>
          </div>

          {/* Hero Header Card with Bridge Graphic Motif */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 p-6 mb-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="w-1/3 bg-[#FF9933]"></div>
              <div className="w-1/3 bg-white border-y border-slate-200"></div>
              <div className="w-1/3 bg-[#138808]"></div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#ea580c] text-xs border border-amber-200 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">event_available</span>
                    <span>Effective &amp; Updated: September 17, 2026</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#00236f] text-xs font-semibold border border-blue-100">
                    Ref: KS-LEGAL-TOS-2026-V3
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  <span className="material-symbols-outlined text-[13px]">policy</span> National Regulatory Standard
                </span>
              </div>

              <div className="mt-1">
                <h2 className="text-2xl text-slate-900 tracking-tight font-bold">Terms of Service</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Academia–Industry Collaboration Platform. Please read these binding terms before registering, accessing opportunities, or exchanging institutional data.
                </p>
              </div>

              <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#00236f] text-[20px] shrink-0 mt-0.5">shield</span>
                  <div>
                    <p className="text-xs leading-relaxed font-medium">
                      Welcome to Kaushal Setu (“Kaushal Setu,” “we,” “our,” or “us”). Kaushal Setu is an academia–industry platform designed to facilitate interaction, collaboration, learning, skill development, opportunities, and connections between students, educational institutions, professionals, employers, and industry organizations.
                    </p>
                    <p className="text-xs leading-relaxed mt-2 pt-2 border-t border-slate-200">
                      By accessing or using the Kaushal Setu website and its services, you agree to be bound by these Terms of Service (“Terms”). If you do not agree with these Terms, please do not use the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <span className="material-symbols-outlined text-[#00236f] text-[18px]">school</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Higher Education</span>
                    <span className="text-xs font-semibold text-slate-900">Student &amp; Faculty Nodes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <span className="material-symbols-outlined text-[#ea580c] text-[18px]">apartment</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Industry Partners</span>
                    <span className="text-xs font-semibold text-slate-900">MoUs &amp; Placements</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">fact_check</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Statutory Rights</span>
                    <span className="text-xs font-semibold text-slate-900">IP &amp; Fair Governance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Quick Navigation Tray */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#00236f]">menu_book</span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Statutory Academic Index</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#00236f] text-[11px] font-semibold border border-blue-100">
                  21 Enforceable Clauses
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[11px]">
                  All Subsections
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth">
              {[
                { id: 'sec-1', label: '1. Eligibility' },
                { id: 'sec-2', label: '2. Services' },
                { id: 'sec-3', label: '3. User Accounts' },
                { id: 'sec-4', label: '4. User Content' },
                { id: 'sec-6', label: '6. Opportunities' },
                { id: 'sec-7', label: '7. Acceptable Use' },
                { id: 'sec-8', label: '8. Intellectual Property' },
                { id: 'sec-10', label: '10. Privacy' },
                { id: 'sec-16', label: '16. Termination' },
                { id: 'sec-18', label: '18. Governing Law' },
                { id: 'sec-21', label: '21. Contact Us' }
              ].map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[#00236f] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Search / Filter Mini Bar */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00236f] ml-1">search</span>
              <input
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
                id="clauseSearch"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setRoleFilter('');
                }}
                placeholder="Search clause text (e.g. Internships, Liability, IP, MoU)..."
                type="text"
              />
              {(searchQuery || roleFilter) && (
                <button
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('');
                  }}
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">Filter by role:</span>
              <button
                onClick={() => {
                  setRoleFilter('student');
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                  roleFilter === 'student' ? 'bg-[#00236f] text-white border-[#00236f]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">school</span> Students
              </button>
              <button
                onClick={() => {
                  setRoleFilter('institution');
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                  roleFilter === 'institution' ? 'bg-[#ea580c] text-white border-[#ea580c]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">account_balance</span> Colleges &amp; Universities
              </button>
              <button
                onClick={() => {
                  setRoleFilter('employer');
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                  roleFilter === 'employer' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">business</span> Industry Partners
              </button>
              <button
                onClick={() => {
                  setRoleFilter('');
                  setSearchQuery('');
                }}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold shrink-0 border cursor-pointer ${
                  !roleFilter && !searchQuery ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                All Clauses
              </button>
            </div>
          </div>

          {/* Clauses List Container */}
          <div className="flex flex-col gap-5" id="clauseContainer">
            {filteredClauses.map(clause => (
              <article
                key={clause.id}
                id={clause.id}
                className="clause-card p-6 rounded-xl bg-white shadow-sm border border-slate-200 scroll-mt-24 transition-all duration-150"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-[#00236f] font-bold text-xs flex items-center justify-center">
                    {clause.num}
                  </span>
                  <h3 className="text-base text-slate-900 font-bold">{clause.title}</h3>
                </div>
                {clause.content}
              </article>
            ))}

            {filteredClauses.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                <p className="text-sm font-semibold text-slate-800">No matching clauses found.</p>
                <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "internships", "liability", or "eligibility".</p>
                <button
                  onClick={() => { setSearchQuery(''); setRoleFilter(''); }}
                  className="mt-3 px-3 py-1.5 bg-[#00236f] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Micro Interaction Feedback / Acceptance Panel */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-white border-l-4 border-l-[#00236f] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#00236f] text-[20px]">verified</span>
                <h4 className="text-sm text-[#00236f] font-bold">Institutional Endorsement &amp; Statutory Validity</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Endorsed for Higher Education Institutions, Technical Colleges, Universities, Skill Certification Bodies, and Industrial Apprenticeship Programs under national digital skill guidelines.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  className="mt-1 w-5 h-5 rounded text-[#00236f] focus:ring-0 accent-[#00236f] cursor-pointer"
                  id="acknowledgementCheck"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  type="checkbox"
                />
                <label className="text-xs text-slate-800 cursor-pointer select-none font-medium leading-relaxed" htmlFor="acknowledgementCheck">
                  I acknowledge that I have thoroughly reviewed the Kaushal Setu Terms of Service, including the guidelines for academia-industry interactions, intellectual property, institutional credentials, and eligibility criteria.
                </label>
              </div>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                  onClick={() => onNavigate ? onNavigate('login') : handleBack()}
                  id="authContinueBtn"
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white text-xs font-bold text-center shadow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    acknowledged ? 'bg-[#16A34A] hover:bg-emerald-700' : 'bg-[#00236f] hover:bg-blue-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Return to Registration / Login</span>
                </button>
                <button
                  onClick={() => onNavigate ? onNavigate('privacy-policy') : null}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 transition-colors text-[#00236f] border border-slate-200 text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">privacy_tip</span>
                  <span>Review Privacy Policy</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#FF9933]">National Higher Education &amp; Skill Development Helpdesk</span>
                <span className="text-[11px] text-slate-400">For compliance, academic tie-ups, or institutional grievances: support@kaushalsetu.gov.in</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded bg-white/10 text-[11px] font-mono text-white">Toll Free: 1800-KS-SETU</span>
              </div>
            </div>
          </div>

          {/* Floating Scroll-to-Top Button */}
          {showScrollTop && (
            <button
              className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#00236f] hover:bg-blue-900 text-white shadow-xl transition-all cursor-pointer flex items-center justify-center"
              onClick={scrollToTop}
              title="Scroll to top"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
