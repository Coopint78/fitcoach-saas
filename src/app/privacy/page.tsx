import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — FitCoach",
  description: "FitCoach privacy policy: how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: July 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Who we are</h2>
            <p className="text-muted-foreground">
              FitCoach (&quot;we&quot;, &quot;our&quot;, &quot;the Platform&quot;) is a SaaS platform that connects personal trainers with their clients. Our website is <a href="https://fit-coach.vip" className="text-primary hover:underline">https://fit-coach.vip</a> and our mobile app is available on iOS and Android. For privacy inquiries, contact us at <a href="mailto:info@fit-coach.vip" className="text-primary hover:underline">info@fit-coach.vip</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Data we collect</h2>
            <p className="text-muted-foreground mb-3">We collect the following data when you use FitCoach:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li><strong className="text-foreground">Account data:</strong> name, email address, and role (trainer or client) provided at registration.</li>
              <li><strong className="text-foreground">Profile data:</strong> bio, specialty, location, Instagram handle, and profile photo (trainers only, optional).</li>
              <li><strong className="text-foreground">Health & fitness data:</strong> body metrics (weight, body fat percentage) and progress photos uploaded voluntarily by clients.</li>
              <li><strong className="text-foreground">Session data:</strong> scheduled sessions, availability slots, and workout routines.</li>
              <li><strong className="text-foreground">Payment data:</strong> processed exclusively by Stripe. We do not store card numbers or full payment details on our servers.</li>
              <li><strong className="text-foreground">Communication data:</strong> messages exchanged between trainers and clients through the in-app chat.</li>
              <li><strong className="text-foreground">Device data:</strong> push notification tokens for sending session reminders (optional, requires explicit permission).</li>
              <li><strong className="text-foreground">Contacts data:</strong> if you choose to use the &quot;Import from Contacts&quot; feature in the mobile app, we access your device&apos;s contact list solely to display it within the app so you can select which contacts to add as clients. We only store the name, phone number, and email address of the contacts you explicitly select. Contact data is never accessed automatically, never shared with third parties, and never used for advertising or any purpose other than creating client records at your request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. How we use your data</h2>
            <p className="text-muted-foreground mb-3">We use your data exclusively to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Provide, operate, and improve the FitCoach platform.</li>
              <li>Process payments and manage subscriptions through Stripe.</li>
              <li>Send session reminders and in-app notifications (with your permission).</li>
              <li>Allow trainers and clients to communicate and track fitness progress.</li>
              <li>Display trainer profiles in the public trainer directory.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We do not sell your data to third parties. We do not use your data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Data sharing</h2>
            <p className="text-muted-foreground mb-3">Your data is shared only with the service providers necessary to operate FitCoach:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li><strong className="text-foreground">Supabase</strong> — database and file storage (servers in the EU).</li>
              <li><strong className="text-foreground">Stripe</strong> — payment processing.</li>
              <li><strong className="text-foreground">Expo / Apple / Google</strong> — push notification delivery.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Trainer profile information (name, bio, specialty, location) is visible to all users of the platform as part of the trainer directory feature.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Health data</h2>
            <p className="text-muted-foreground">
              Body metrics and progress photos are sensitive health data. This data is visible only to the client who uploads it and their assigned trainer. It is never shared with third parties, never used for advertising, and never sold. You may delete this data at any time from within the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. If you delete your account, your personal data is permanently removed within 30 days. Some data may be retained in anonymized form for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Your rights</h2>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li><strong className="text-foreground">Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate data.</li>
              <li><strong className="text-foreground">Deletion</strong> — request permanent deletion of your account and all associated data.</li>
              <li><strong className="text-foreground">Portability</strong> — request your data in a structured, machine-readable format.</li>
              <li><strong className="text-foreground">Objection</strong> — object to certain processing activities.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise any of these rights, email us at <a href="mailto:info@fit-coach.vip" className="text-primary hover:underline">info@fit-coach.vip</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Push notifications</h2>
            <p className="text-muted-foreground">
              The FitCoach mobile app may request permission to send push notifications for session reminders. This permission is entirely optional. You can enable or disable notifications at any time in your device settings. We do not send marketing or promotional push notifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Security</h2>
            <p className="text-muted-foreground">
              We apply industry-standard security measures including HTTPS encryption, row-level security on all database tables, and secure authentication via Supabase Auth. Passwords are never stored in plain text. Payment data is handled entirely by Stripe and never touches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Children</h2>
            <p className="text-muted-foreground">
              FitCoach is not directed at children under 13 years of age. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal data, please contact us at <a href="mailto:info@fit-coach.vip" className="text-primary hover:underline">info@fit-coach.vip</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Changes to this policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Contact</h2>
            <p className="text-muted-foreground">
              For any privacy-related questions or requests, contact us at: <a href="mailto:info@fit-coach.vip" className="text-primary hover:underline">info@fit-coach.vip</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FitCoach. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
