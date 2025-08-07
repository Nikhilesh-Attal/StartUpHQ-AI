import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SupportPage() {
  return (
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="font-headline text-3xl">Support</h1>
            <p className="text-muted-foreground">
              Need help? Reach out or find answers below.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Fill out the form or reach us via LinkedIn for direct support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Issue with dashboard" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue..."
                  className="min-h-[150px]"
                />
              </div>
              <Button asChild>
                <a href="https://www.linkedin.com/in/nikhileshattal/" target="_blank" rel="noopener noreferrer">
                  Contact on LinkedIn
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-headline text-2xl">FAQs</h2>
            <p className="text-muted-foreground">Common questions answered.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I upgrade my plan?</AccordionTrigger>
              <AccordionContent>
                Visit the billing section in your account settings to upgrade.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I invite more team members?</AccordionTrigger>
              <AccordionContent>
                Yes! Go to the "Team" tab under your dashboard to invite others.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does the AI assistant work?</AccordionTrigger>
              <AccordionContent>
                It uses advanced Genkit flows to analyze your data and generate personalized startup help.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Yes. All data is encrypted and stored securely in Appwrite.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
