import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        {/* Back link */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>

        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-slate-600 text-lg">Last updated: October 17, 2025</p>
        </header>

        {/* Content Body (document-style) */}
        <article className="prose prose-slate max-w-none">
          <section className="mb-6">
            <p className="text-lg leading-8 text-slate-700">
              These Terms of Service ("Terms") govern your access to and use of the Disagreement.AI platform and services. By creating an account or using the service, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Use of Service</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              You may use the service only in compliance with these Terms and all applicable laws. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Content</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              You retain ownership of the content you submit to the service. By submitting content, you grant us a limited license to host, process, and display that content for the purpose of operating and improving the service. You are solely responsible for the content you provide, including ensuring it does not infringe on the rights of others or violate applicable laws.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Prohibited Conduct</h2>
            <ul className="mt-2 list-disc pl-6 text-slate-700 text-lg leading-8">
              <li>Attempting to access another user’s account without permission</li>
              <li>Interfering with or disrupting the integrity or performance of the service</li>
              <li>Uploading or transmitting malicious code</li>
              <li>Using the service for unlawful or abusive purposes</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Disclaimer</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              The AI mediator provides guidance and suggestions only. It does not constitute legal advice, and outcomes are not guaranteed. You are responsible for independent judgment regarding any actions or agreements.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Termination</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We may suspend or terminate your access to the service at any time for violations of these Terms or to protect the service or its users.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Limitation of Liability</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              To the maximum extent permitted by law, Disagreement.AI will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Changes to These Terms</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              We may modify these Terms from time to time. If we make material changes, we will provide notice as appropriate. Your continued use of the service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contact Us</h2>
            <p className="mt-2 text-slate-700 text-lg leading-8">
              If you have questions about these Terms, please <Link to={{ pathname: '/contact' }} className="text-blue-600 hover:underline">contact us</Link>.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
