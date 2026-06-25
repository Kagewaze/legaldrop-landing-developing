import React from "react";
import Head from "next/head";
import Layout from "../(main)/layout";

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | LegalDrop</title>
        <meta
          name="description"
          content="Privacy Policy of LegalDrop for secure, compliant delivery solutions."
        />
      </Head>

      <Layout>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
        <p className="mb-4">
          <strong>Effective Date:</strong> 2025-01-06
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
          <p className="text-lg">
               Your privacy is important to us. This Privacy Policy describes how
              LegalDrop (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;)
              collects, uses, shares, and protects information from users
              (&quot;you&quot;) when you access our app (&quot;LegalDrop&quot;)
              or related services. By using LegalDrop, you agree to the terms
              outlined in this policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-lg">We collect the following types of information:</p>
          <ul className="list-disc pl-6 text-lg">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address.</li>
            <li><strong>Location Data:</strong> Real-time location information to enable delivery tracking.</li>
            <li><strong>Payment Information:</strong> Secure payment details processed through third-party providers.</li>
            <li><strong>Usage Data:</strong> Device information, IP address, and app usage patterns.</li>
            <li><strong>Communication Data:</strong> Information from messages, emails, or calls to customer support.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-lg">We use the information collected for the following purposes:</p>
          <ul className="list-disc pl-6 text-lg">
            <li>To provide and improve our services.</li>
            <li>To respond to customer support requests.</li>
            <li>To send promotional offers and updates, where permitted by law.</li>
            <li>To analyze app performance and user experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">3. Sharing Your Information</h2>
          <p className="text-lg">
            We do not sell your personal information. However, we may share information with:
          </p>
          <ul className="list-disc pl-6 text-lg">
            <li><strong>Service Providers:</strong> Partners assisting in app operations or delivery.</li>
            <li><strong>Legal Requirements:</strong> To comply with applicable laws.</li>
            <li><strong>Business Transfers:</strong> In case of a merger or sale of assets.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-lg">
            We implement security measures to protect your information, including encryption and restricted access.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights and Choices</h2>
          <p className="text-lg">You have the right to:</p>
          <ul className="list-disc pl-6 text-lg">
            <li>Access, correct, or delete your personal information.</li>
            <li>Opt-out of marketing communications.</li>
            <li>Withdraw consent for location tracking via your device settings.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">6. Cookies and Tracking Technologies</h2>
          <p className="text-lg">
            We use cookies and similar technologies to enhance your experience and analyze usage patterns. You can manage cookie preferences through your browser.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">7. Third-Party Services</h2>
          <p className="text-lg">
            Our app may contain links to third-party services. We are not responsible for their privacy practices.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">8. Children’s Privacy</h2>
          <p className="text-lg">
            Our app is not intended for children under 13. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
          <p className="text-lg">
            We may update this Privacy Policy to reflect changes in our practices. Updates will be posted on this page.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
          <p className="text-lg">
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <p className="text-lg">
            <strong>Email:</strong> legaldropeng@gmail.com
            <br />
            <strong>Phone:</strong>+13435984928
          </p>
        </section>
      </main>
      </Layout>

    </>
  );
};

export default PrivacyPolicy;
