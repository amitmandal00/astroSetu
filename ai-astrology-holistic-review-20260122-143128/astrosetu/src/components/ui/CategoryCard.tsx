import Link from "next/link";
import { clsx } from "clsx";
import { ServiceIcon } from "./ServiceIcon";
import { AstroImage } from "./AstroImage";

type CategoryCardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
  imageUrl?: string;
  className?: string;
};

export function CategoryCard({ title, description, icon, href, imageUrl, className = "" }: CategoryCardProps) {
  return (
    <Link href={href} className={clsx("group block", className)}>
      <div className="relative rounded-3xl border-2 border-slate-200 bg-white hover:border-purple-300 hover:shadow-xl transition-all overflow-hidden">
        {imageUrl && (
          <div className="h-32 overflow-hidden">
            <AstroImage
              src={imageUrl}
              alt={title}
              width={400}
              height={128}
              className="w-full h-full"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-3">
            <ServiceIcon service={icon} size="md" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 mb-1">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
            <span className="text-purple-400 group-hover:text-purple-600 text-xl">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

