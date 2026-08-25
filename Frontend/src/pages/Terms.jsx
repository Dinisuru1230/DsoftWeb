import { Link } from 'react-router-dom';

export default function Terms() {
  const sections = [
    {
      title: 'Changes to Terms',
      icon: 'update',
      content:
        'DSoft Pack reserves the right to modify these Terms at any time without notice. Any changes will be posted on the Site, and your continued use of the Site constitutes acceptance of the revised Terms. We recommend periodically reviewing these Terms for updates.',
    },
    {
      title: 'Product Activation',
      icon: 'verified_user',
      content:
        'All product keys are recommended to be activated within the warranty period, as much as possible. Failure to do so will result in expiration, with no replacement or refund provided.',
    },
    {
      title: 'General Use Terms',
      icon: 'gavel',
      content:
        'DSoft Pack provides content and services through the Site, including materials, trademarks, and services ("Materials"). You are granted a limited, non-transferable license to use the Materials for personal or internal business use only. Modification, reproduction, or exploitation of the Materials is prohibited.\n\nYou agree not to circumvent security measures, misuse the Site, or engage in prohibited conduct, including unauthorized access, harassment, or disruption of the Site\'s operations.',
    },
    {
      title: 'Password Restricted Areas',
      icon: 'lock',
      content:
        'Certain areas of the Site are password-restricted. If you are an authorized user, you are responsible for maintaining the confidentiality of your account and notifying DSoft Pack of any security breaches.',
    },
    {
      title: 'Pricing and Payments',
      icon: 'payments',
      content:
        'Fees and charges for services are based on DSoft Pack\'s billing terms. Fraudulent payments may result in suspension or termination of access.',
    },
    {
      title: 'Privacy Policy',
      icon: 'shield',
      content:
        'Your use of the Site is governed by our Privacy Policy, available on the Privacy Policy Page.',
    },
    {
      title: 'Third-Party Content',
      icon: 'extension',
      content:
        'Third-party content provided on the Site is for personal or internal business use only. You agree not to modify or reproduce third-party content without authorization.',
    },
    {
      title: 'Submissions',
      icon: 'send',
      content:
        'By submitting data or communications on the Site, you grant DSoft Pack a perpetual, royalty-free license to use, reproduce, and modify such submissions.',
    },
    {
      title: 'Links to Third-Party Sites',
      icon: 'open_in_new',
      content:
        'The Site may contain links to third-party sites. DSoft Pack is not responsible for the content of these sites.',
    },
    {
      title: 'Unauthorized Activities',
      icon: 'block',
      content:
        'Unauthorized use of Materials may violate laws and regulations. You agree to indemnify DSoft Pack for any claims arising from your use of the Site.',
    },
    {
      title: 'Trademarks and Copyright',
      icon: 'copyright',
      content:
        'All trademarks and content on the Site are the property of their respective owners. Reproduction or distribution of copyrighted material is prohibited without consent.',
    },
    {
      title: 'Disclaimer of Warranties',
      icon: 'warning',
      content:
        'Your use of the Site is at your own risk. DSoft Pack does not warrant the accuracy or timeliness of materials or third-party content.',
    },
    {
      title: 'Limitation of Liability',
      icon: 'balance',
      content:
        'DSoft Pack\'s liability for damages is limited to fifty dollars ($50). DSoft Pack is not liable for indirect, incidental, or consequential damages.',
    },
    {
      title: 'Refunds and Cancellations',
      icon: 'assignment_return',
      content:
        'For information on refunds and cancellations, refer to our Refund Policy or contact our support team.',
    },
    {
      title: 'General',
      icon: 'info',
      content:
        'DSoft Pack may terminate access to the Site for violations of these Terms. Disputes will be governed by Maryland law. These Terms constitute the entire agreement between you and DSoft Pack.',
    },
  ];

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-12 py-10">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight mb-3">
          Terms & Conditions
        </h1>
        <p className="font-body-md text-base md:text-lg text-on-surface-variant leading-relaxed">
          Please read these terms and conditions carefully before using our services or purchasing any digital products.
        </p>
      </div>

      {/* Terms Accordion / Cards List */}
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <section
            key={idx}
            className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-xs hover:shadow-ambient transition-all duration-300"
          >
            <div className="flex items-center gap-3.5 mb-3 border-b border-outline-variant/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">{sec.icon}</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-on-background">
                {sec.title}
              </h2>
            </div>
            <div className="text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-line pl-1 md:pl-13">
              {sec.content}
            </div>
          </section>
        ))}
      </div>

      {/* Footer Contact Callout */}
      <div className="mt-12 bg-primary-container/20 rounded-2xl p-6 md:p-8 border border-primary/20 text-center space-y-3">
        <h3 className="text-lg font-bold text-on-background">Have questions regarding our Terms?</h3>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto">
          Thank you for reviewing these Terms. If you have any questions or require further clarification, please feel free to reach out to us.
        </p>
        <div className="pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
