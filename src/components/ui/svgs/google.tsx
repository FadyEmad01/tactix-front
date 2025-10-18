import type { SVGProps } from "react";

const Google = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="google__blue" x1="12" x2="36" y1="12" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="100%" stopColor="#34A853" />
      </linearGradient>

      <linearGradient id="google__red" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#FBBC05" />
      </linearGradient>

      <linearGradient id="google__green" x1="0" y1="24" x2="24" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#34A853" />
        <stop offset="100%" stopColor="#0F9D58" />
      </linearGradient>

      <linearGradient id="google__yellow" x1="24" y1="0" x2="48" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBC05" />
        <stop offset="100%" stopColor="#F4B400" />
      </linearGradient>
    </defs>

    {/* G shape built from official color segments */}
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.59l6.85-6.85C36.63 2.69 30.8 0 24 0 14.62 0 6.51 5.31 2.56 13.09l7.99 6.21C12.3 13.11 17.67 9.5 24 9.5z"
    />
    <path
      fill="#34A853"
      d="M46.14 24.5c0-1.57-.14-3.08-.41-4.5H24v9.02h12.45c-.54 2.9-2.19 5.36-4.65 7.03l7.24 5.63C43.68 37.46 46.14 31.46 46.14 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.55 28.3a14.5 14.5 0 0 1 0-8.59l-7.99-6.21a24 24 0 0 0 0 21.01l7.99-6.21z"
    />
    <path
      fill="#4285F4"
      d="M24 48c6.48 0 11.93-2.13 15.9-5.82l-7.24-5.63c-2.02 1.36-4.61 2.17-8.66 2.17-6.33 0-11.7-3.61-13.45-8.89l-7.99 6.21C6.51 42.69 14.62 48 24 48z"
    />
  </svg>
);

export { Google };
