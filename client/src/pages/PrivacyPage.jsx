import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        {/* Back link */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>

        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-slate-600 text-lg">Last updated: October 17, 2025</p>
        </header>

        {/* Content Body (document-style) */}
        <article className="prose prose-slate max-w-none">
          <section className="mb-6">
            <p className="text-lg leading-8 text-slate-700">
              At Disagreement.AI ("we", "us", "our"), your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Information We Collect</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We collect information that you provide directly to us, such as when you create an account, participate in disagreements, invite participants, or contact support. This may include your name, email address, dispute titles and descriptions, messages you send in the chat, and files you upload. We may also collect technical information like IP address, device identifiers, and usage data to improve our services and maintain security.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">How We Use Information</h2>
            <ul className="mt-2 list-disc pl-6 text-slate-700 text-lg leading-8">
              <li>To provide, maintain, and improve the Disagreement.AI platform</li>
              <li>To authenticate users and secure accounts</li>
              <li>To facilitate invitations and collaboration between participants</li>
              <li>To communicate important updates and respond to inquiries</li>
              <li>To protect against fraud, abuse, and security risks</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Sharing</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We do not sell your personal information. We may share information with trusted service providers who assist us in operating our services (e.g., hosting, email delivery) under confidentiality and data protection obligations, or when required by law.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Security</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We implement administrative, technical, and physical safeguards designed to protect your information. No system can be fully secure, but we continuously work to enhance our protections.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Choices</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              You can update certain account information via your profile page, manage invitations and participation, and contact us if you need assistance accessing or deleting your information.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Retention & 120-Day Deletion Policy</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              In alignment with our governance and ethical commitments, Disagreement.AI follows a strict data deletion policy for resolved disputes. <strong>All sensitive user data related to a dispute will be permanently and automatically deleted 120 days after case resolution.</strong> This includes messages, uploaded files, and any other dispute-specific content. System logs or security telemetry may be retained beyond this period where legally required or to protect the service, but will not include dispute content.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">International Transfers</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We may process and store information in countries other than your own. When we transfer data, we take steps to ensure adequate safeguards are in place.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Children's Privacy</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              Our services are not directed to children under 13, and we do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Changes to This Policy</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We may update this Privacy Policy from time to time. We will post the updated policy on this page with a new "Last updated" date. Your continued use of the service signifies acceptance of the changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contact Us</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              If you have questions about this Privacy Policy, please contact us at <Link to={{ pathname: '/contact' }} className="text-blue-600 hover:underline">Contact Us</Link>.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
