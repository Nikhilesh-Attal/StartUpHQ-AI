import Link from "next/link";
import { AppLogo } from "./app-logo";

const TwitterIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 fill-muted-foreground transition-colors hover:fill-foreground"
  >
    <title>Twitter</title>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 fill-muted-foreground transition-colors hover:fill-foreground"
  >
    <title>LinkedIn</title>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Logo & Copyright */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <AppLogo />
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} StartupHQ AI. All rights reserved.
          </p>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex justify-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/support" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        {/* Right: Social Links */}
        <div className="flex justify-center gap-4">
          <Link
            href="https://x.com/AttalNikhilesh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <TwitterIcon />
          </Link>
          <Link
            href="https://www.linkedin.com/in/nikhilesh-attal"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
}
