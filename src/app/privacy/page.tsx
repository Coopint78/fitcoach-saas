export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px", fontFamily: "sans-serif", lineHeight: 1.7 }}>
      <h1>Privacy Policy — FitCoach</h1>
      <p><em>Last updated: July 30, 2026</em></p>

      <h2>1. Information We Collect</h2>
      <p>FitCoach collects the following information when you use our app:</p>
      <ul>
        <li><strong>Account information:</strong> name, email address, and password when you register.</li>
        <li><strong>Profile data:</strong> profile photo, fitness goals, and body metrics you voluntarily provide.</li>
        <li><strong>Training data:</strong> workout sessions, routines, exercises, and progress records you create or log.</li>
        <li><strong>Device information:</strong> device type, operating system version, and app version for diagnostic purposes.</li>
        <li><strong>Usage data:</strong> app interactions and features used, to improve the service.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and operate the FitCoach service.</li>
        <li>To allow trainers and clients to connect and share training plans.</li>
        <li>To send push notifications about your training (only if you grant permission).</li>
        <li>To process subscription payments via Stripe.</li>
        <li>To improve the app and fix issues.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with:</p>
      <ul>
        <li><strong>Supabase:</strong> our database and authentication provider.</li>
        <li><strong>Stripe:</strong> payment processing for subscriptions.</li>
        <li><strong>Apple / Google:</strong> for push notification delivery.</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>Your data is stored on secure servers. We use industry-standard encryption (TLS) for all data in transit. Passwords are never stored in plain text.</p>

      <h2>5. Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:info@fit-coach.vip">info@fit-coach.vip</a>. To delete your account and all associated data, visit your Profile settings in the app and select "Delete account".</p>

      <h2>6. Data Retention</h2>
      <p>We retain your data for as long as your account is active. After account deletion, data is removed within 30 days.</p>

      <h2>7. Children</h2>
      <p>FitCoach is not directed to children under 18. We do not knowingly collect data from minors.</p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy. We will notify you of significant changes via email or in-app notification.</p>

      <h2>9. Contact</h2>
      <p>For privacy questions, contact us at: <a href="mailto:info@fit-coach.vip">info@fit-coach.vip</a></p>
    </main>
  );
}
