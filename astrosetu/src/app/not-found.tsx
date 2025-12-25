import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader eyebrow="404" title="Page Not Found" />
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

