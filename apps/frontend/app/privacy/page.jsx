import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'CarVerify AI Privacy Policy - How we protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14">
          <Link href="/" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </header>

      <div className="section max-w-3xl pt-8">
        <h1 className="font-display font-bold text-3xl text-white mb-4">Privacy Policy</h1>
        <p className="text-surface-400 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-6 text-surface-300">
          <p>
            CarVerify AI ("we", "us", or "our") operates the CarVerify AI platform. This Privacy Policy describes how we collect, use, and share information when you use our service.
          </p>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (name, email, phone number)</li>
              <li>Vehicle identification numbers (VINs) you search</li>
              <li>Payment information processed through Razorpay</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate vehicle history reports</li>
              <li>Process payments and subscriptions</li>
              <li>Send you transactional emails and SMS alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">3. Information Sharing</h2>
            <p className="mb-2">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service providers who assist in our operations</li>
              <li>Vehicle data providers for report generation</li>
              <li>Payment processors for transaction handling</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including encryption, access controls, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your personal information as long as your account is active or as needed to provide you services. You can request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">6. Your Rights</h2>
            <p className="mb-2">Under Indian data protection laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">7. Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 18. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@carverify.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}