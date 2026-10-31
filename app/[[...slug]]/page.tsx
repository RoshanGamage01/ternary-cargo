import Screens from "@/components/screens";
export default function Page({ params, searchParams }: { params: { slug?: string[] }; searchParams: Record<string, string> }) {
  return <Screens route={params.slug?.join("/") ?? "login"} q={searchParams} />;
}
