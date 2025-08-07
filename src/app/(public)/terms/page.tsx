import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto space-y-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Welcome to <strong>StartupHQ AI</strong>!</p>
          <p>
            These terms and conditions govern your use of our website located at <code>startup.com</code>.
            By accessing this site, you accept these terms in full. If you do not agree, please do not use StartupHQ AI.
          </p>

          <h3 className="font-headline">Cookies</h3>
          <p>
            We use cookies to enhance your experience. By using our website, you consent to the use of cookies as outlined in our Privacy Policy.
          </p>

          <h3 className="font-headline">License</h3>
          <p>
            All intellectual property rights for content on StartupHQ AI are owned by StartupHQ AI and/or its licensors. You may use the content for personal purposes only and must not:
          </p>
          <ul>
            <li>Republish material from StartupHQ AI</li>
            <li>Sell, rent or sub-license material</li>
            <li>Reproduce or duplicate material</li>
            <li>Redistribute content without permission</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
