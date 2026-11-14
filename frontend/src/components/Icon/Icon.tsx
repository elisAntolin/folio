import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  name: "star" | "filter" | "grid";
  filled?: boolean;
};

export default function Icon({ name, filled = false, ...props }: IconProps) {
  const paths = {
    star: "M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9l-5.25 2.8 1-5.85L3.5 9.7l5.9-.9L12 3.5Z",
    filter: "M4.6 5h14.8c.8 0 1.2.9.7 1.5L14 13.4V19l-4 2v-7.6L3.9 6.5C3.4 5.9 3.8 5 4.6 5Z",
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "grid" ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </>
      ) : (
        <path d={paths[name]} />
      )}
    </svg>
  );
}
