import Header from "@/components/layout/header";
import PpmEvaluationForm from "@/components/forms/ppm-evaluation-form";

export default function PpmEvaluation() {
  return (
    <div>
      <Header
        title="PPM (Parts Per Million) Evaluation"
        description="Evaluate supplier quality performance based on parts per million defect rates"
      />
      
      <div className="p-6">
        <PpmEvaluationForm />
      </div>
    </div>
  );
}