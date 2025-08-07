import { Rocket } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2" data-ai-hint="logo">
      <Rocket className="h-6 w-6 text-primary" />
      <span className="font-headline text-lg font-bold">StartupHQ AI</span>
    </div>
  );
}
