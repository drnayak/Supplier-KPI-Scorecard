import Header from "@/components/layout/header";
import PriceEvaluationForm from "@/components/forms/price-evaluation-form";

export default function PriceEvaluation() {
  return (
    <div>
      <Header
        title="Price Variance Evaluation"
        description="Evaluate supplier performance based on PO vs Invoice pricing differences"
      />
      
      <div className="p-6">
        <PriceEvaluationForm />
      </div>
    </div>
  );
}
