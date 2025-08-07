import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto space-y-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            At <strong>StartupHQ AI</strong>, accessible from <code>startup.com</code>, your privacy is one of our top priorities.
            This policy explains what information we collect and how we use it.
          </p>

          <h3 className="font-headline">Log Files</h3>
          <p>
            Like many websites, we use log files. These include IP addresses, browser type, ISP, time stamps, and pages visited.
            This data is used solely for internal analysis and is not personally identifiable.
          </p>

          <h3 className="font-headline">Consent</h3>
          <p>
            By using our site, you consent to our Privacy Policy and agree to its terms.
            For any questions, feel free to reach out to us on LinkedIn.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
