import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12 4 4L19 6" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icon>
  );
}

export function DevicesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="15" height="11" rx="2" />
      <path d="M8 20h4m-2-5v5m10-9v8m-3 0h6" />
    </Icon>
  );
}

export function FingerprintIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 11a3 3 0 0 1 3 3c0 2.7-.6 4.7-1.6 6" />
      <path d="M8.8 20c.8-1.6 1.2-3.5 1.2-5.8a2 2 0 0 1 4 0c0 1.3-.1 2.6-.4 3.8" />
      <path d="M6 17.5c.4-1.2.6-2.3.6-3.5a5.4 5.4 0 0 1 10.8 0c0 2.1-.2 4-.8 5.5" />
      <path d="M4.1 13.5a7.9 7.9 0 0 1 15.8 0c0 1.3-.1 2.4-.2 3.5" />
    </Icon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8m-3 3 3 3m-6 0 2 2" />
    </Icon>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 5H5v14h5m4-4 4-3-4-3m4 3H9" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
      <path d="m14.5 7.5 3 3" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </Icon>
  );
}

export function PointerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3l6 16 2.5-6.5L20 10 5 3Z" />
    </Icon>
  );
}

export function HandIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1V4.5a1.5 1.5 0 0 1 3 0V12m0-.5V6a1.5 1.5 0 0 1 3 0v8c0 3.9-2.6 7-6.5 7-2.6 0-4.4-1.4-5.6-3.4l-1.5-3.8a1.5 1.5 0 0 1 2.5-1.6L8 14" />
    </Icon>
  );
}

export function TableIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h16v14H4zM4 10h16M10 10v9" />
    </Icon>
  );
}

export function AreaIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4h4m4 0h4m4 0v4m0 4v4m0 4h-4m-4 0H8m-4 0v-4m0-4V8" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function FitIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9V4h5m11 5V4h-5M4 15v5h5m11-5v5h-5" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </Icon>
  );
}
