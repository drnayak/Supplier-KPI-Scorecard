import Header from "@/components/layout/header";
import QuantityEvaluationForm from "@/components/forms/quantity-evaluation-form";

export default function QuantityEvaluation() {
  return (
    <div>
      <Header
        title="Quantity Variance Evaluation"
        description="Evaluate supplier performance based on ordered vs received quantities"
      />
      
      <div className="p-6">
        <QuantityEvaluationForm />
      </div>
    </div>
  );
}
