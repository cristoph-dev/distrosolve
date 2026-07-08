import Link from "next/link";
import { ExternalLink } from "lucide-react";

type GlossaryPopoverLinkProps = {
  href: string;
};

const GlossaryPopoverLink = ({ href }: GlossaryPopoverLinkProps) => {
  return (
    <Link href={href} className="glossary-popover-link">
      Ver en glosario <ExternalLink className="h-3 w-3" />
    </Link>
  );
};

export default GlossaryPopoverLink;
