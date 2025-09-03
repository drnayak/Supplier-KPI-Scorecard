import Header from "@/components/layout/header";
import DeliveryEvaluationForm from "@/components/forms/delivery-evaluation-form";

export default function DeliveryEvaluation() {
  return (
    <div>
      <Header
        title="Delivery Time Evaluation"
        description="Evaluate supplier performance based on scheduled vs actual delivery dates"
      />
      
      <div className="p-6">
        <DeliveryEvaluationForm />
      </div>
    </div>
  );
}
