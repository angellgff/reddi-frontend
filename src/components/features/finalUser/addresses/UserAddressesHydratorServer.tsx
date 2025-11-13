import { getUserAddressesAndSelected } from "@/src/lib/finalUser/addresses/actions";
import UserAddressesHydratorClient from "./UserAddressesHydratorClient";

export default async function UserAddressesHydratorServer() {
  const { addresses, selectedAddressId } = await getUserAddressesAndSelected();
  return (
    <UserAddressesHydratorClient
      addresses={addresses as any}
      selectedAddressId={selectedAddressId}
    />
  );
}
