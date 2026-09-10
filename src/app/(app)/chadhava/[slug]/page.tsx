import { redirect } from "next/navigation";

export default async function ChadhavaDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/pooja/${slug}`);
}
