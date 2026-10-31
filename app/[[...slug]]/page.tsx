import Router from "@/components/router";
export default function Page({ params, searchParams }: { params: { slug?: string[] }; searchParams: Record<string, string> }) {
  return <Router key={(params.slug ?? []).join("/")} r={params.slug?.join("/") ?? "login"} q={searchParams} />;
}
