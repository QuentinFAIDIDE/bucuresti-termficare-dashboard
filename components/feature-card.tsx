import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  imagePath: string;
  description: string;
  href: string;
}

export function FeatureCard({
  title,
  imagePath,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link href={href} className="p-4">
      <Card className="w-full max-w-sm bg-default hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            src={imagePath}
            alt={title}
            width={400}
            height={400}
            priority
          />
          <CardDescription className="my-4">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
