// 1. Swap the imports to react-icons/fa6
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa6";

interface SocialLinksProps {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export default function SocialLinks({
  facebook,
  instagram,
  linkedin,
}: SocialLinksProps) {
  return (
    <div className="flex gap-3 mt-3">
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer">
          {/* 2. Use the new icon components */}
          <FaFacebookF className="w-5 h-5" />
        </a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer">
          <FaInstagram className="w-5 h-5" />
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          <FaLinkedinIn className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}