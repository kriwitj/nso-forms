import FormPreview from "@/components/FormPreview";

export default async function FormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <FormPreview formId={formId} />;
}