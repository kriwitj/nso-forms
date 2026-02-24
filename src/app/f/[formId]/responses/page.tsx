import ResponsesView from "@/components/ResponsesView";

export default async function ResponsesPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <ResponsesView formId={formId} />;
}