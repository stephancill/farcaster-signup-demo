import { makeUserNameProofClaim } from "@farcaster/hub-web";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function RegisterENSButton() {
  const account = useAccount();
  const [isNamesLoading, setIsNameLoading] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  useEffect(() => {
    setIsNameLoading(true);
    fetch("/ens-names?address=" + account.address)
      .then((response) => {
        setIsNameLoading(false);
        return response.json();
      })
      .then((result) => {
        console.log(result);
        setNames(result);
      })
      .catch((error) => {
        setIsNameLoading(false);
        console.error("Error:", error);
      });
  }, [account.address]);

  const handleDomainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(event.target.value);
  };

  const handleRegister = () => {
    if (!selectedDomain || !account.address) {
      return;
    }

    console.log(`Registering domain: ${selectedDomain}`);
    // Add your registration logic here

    const usernameProof = makeUserNameProofClaim({
      name: selectedDomain,
      owner: account.address,
      timestamp: Math.floor(Date.now() / 1000),
    });

    console.log(usernameProof);
  };

  return (
    <div>
      <select
        value={selectedDomain}
        onChange={handleDomainChange}
        disabled={isNamesLoading}
      >
        <option value="">Select a domain</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button
        onClick={handleRegister}
        disabled={!selectedDomain || isNamesLoading}
      >
        Register ENS
      </button>
      {isNamesLoading && <p>Loading domains...</p>}
    </div>
  );
}
