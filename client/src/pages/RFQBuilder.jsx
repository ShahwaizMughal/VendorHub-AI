import { useNavigate } from "react-router-dom";
import RFQForm from "../components/rfq/RFQForm";
import { useCreateRfqMutation } from "../services/rfqApi";

export default function RFQBuilder() {
  const navigate = useNavigate();
  const [createRfq, { isLoading }] = useCreateRfqMutation();

  const handleSubmit = async data => {
    const result = await createRfq(data).unwrap();
    navigate(`/rfqs/${result.data._id}`);
  };

  return <RFQForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
