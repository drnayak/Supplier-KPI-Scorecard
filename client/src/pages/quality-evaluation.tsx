import Header from "@/components/layout/header";
import QualityEvaluationForm from "@/components/forms/quality-evaluation-form";

export default function QualityEvaluation() {
  return (
    <div>
      <Header
        title="Quality Evaluation"
        description="Evaluate supplier performance based on quality notifications and inspection results"
      />
      
      <div className="p-6">
        <QualityEvaluationForm />
      </div>
    </div>
  );
}
