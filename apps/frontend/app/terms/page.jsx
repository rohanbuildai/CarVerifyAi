import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service',
  description: 'CarVerify AI Terms of Service',
};

export default function TermsPage() {
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
        <h1 className="font-display font-bold text-3xl text-white mb-4">Terms of Service</h1>
        <p className="text-surface-400 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-6 text-surface-300">
          <p>
            By accessing and using CarVerify AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">2. Description of Service</h2>
            <p className="mb-2">
              CarVerify AI provides AI-powered vehicle history verification services in India, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vehicle history reports</li>
              <li>Ownership verification</li>
              <li>Insurance status verification</li>
              <li>Accident history analysis</li>
              <li>AI-powered risk assessment</li>
              <li>Chat with AI about vehicle reports</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">3. User Accounts</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">4. Payment and Billing</h2>
            <p className="mb-2">By purchasing our services, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pay all fees associated with your selected plan</li>
              <li>Provide valid payment information</li>
              <li>Allow us to process recurring payments for subscriptions</li>
              <li>Review and understand our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">5. Subscription Terms</h2>
            <p className="mb-2">Subscriptions are:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Billed in advance on a monthly or annual basis</li>
              <li>Automatically renewed unless cancelled</li>
              <li>Subject to fair usage limits as specified in your plan</li>
              <li>Non-refundable except as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">6. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute our services</li>
              <li>Upload malicious code or attempt to hack our systems</li>
              <li>Harass or abuse our staff or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Service are owned by CarVerify AI and are protected by Indian and international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">8. Disclaimers</h2>
            <p className="mb-2">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vehicle data is 100% accurate or complete</li>
              <li>The Service will be uninterrupted or error-free</li>
              <li>Reports will always be available or up-to-date</li>
            </ul>
            <p className="mt-2">
              Vehicle history data is obtained from third-party sources and we cannot guarantee its accuracy. Always verify information from official sources.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CARVERIFY AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold CarVerify AI harmless from any claims, damages, losses, or expenses arising from your use of the Service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">11. Termination</h2>
            <p className="mb-2">
              We may terminate or suspend your account:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>For violations of these Terms</li>
              <li>For non-payment of fees</li>
              <li>At our sole discretion with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in Bangalore, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-white mb-3">14. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at support@carverify.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}