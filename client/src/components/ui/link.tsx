import React from "react";
import { Link as WouterLink } from "wouter";
import { cn } from "@/lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, external = false, children, ...props }, ref) => {
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn("text-primary hover:underline", className)}
          target={props.target || "_blank"}
          rel={props.rel || "noopener noreferrer"}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <WouterLink href={href}>
        {(isActive) => (
          <a
            ref={ref}
            className={cn(
              "text-primary hover:underline",
              isActive && "font-medium text-primary-dark",
              className
            )}
            {...props}
          >
            {children}
          </a>
        )}
      </WouterLink>
    );
  }
);

Link.displayName = "Link";

export { Link };