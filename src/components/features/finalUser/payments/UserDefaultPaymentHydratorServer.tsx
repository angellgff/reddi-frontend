import { getUserDefaultPaymentMethod } from "@/src/lib/finalUser/payments/actions";
import UserDefaultPaymentHydratorClient from "./UserDefaultPaymentHydratorClient";

export default async function UserDefaultPaymentHydratorServer() {
  const { method } = await getUserDefaultPaymentMethod();
  return <UserDefaultPaymentHydratorClient method={method} />;
}
