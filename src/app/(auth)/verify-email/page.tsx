import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
           <MailCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl mt-4">Verify Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address. Please check your inbox and
          click the link to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button type="submit" className="w-full">
          Resend Verification Email
        </Button>
      </CardContent>
    </Card>
  );
}
