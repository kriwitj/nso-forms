import FormBuilder from "@/components/FormBuilder";

export default async function BuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <FormBuilder formId={formId} />;
}
