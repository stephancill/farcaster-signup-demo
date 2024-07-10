import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";

import { useFid } from "@/providers/fidContext";
import { StorageRegistryABI } from "@/abi/StorageRegistryABI";
import { use, useEffect, useState } from "react";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "sonner";

export default function RentStorageUnitButton({
  hasStorage,
  setHasStorage,
  setRentTxHash,
}: {
  hasStorage: boolean;
  setHasStorage: (value: boolean) => void;
  setRentTxHash: (hash: string) => void;
}) {
  const { fid } = useFid();
  const { isConnected } = useAccount();
  const [price, setPrice] = useState<number>(0);

  const {
    data: unitPrice,
    isError: isErrorPriceRead,
    error: errorPriceRead,
  } = useReadContract({
    address: "0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d", // mainnet
    // address: '0xa6B79d91FAD0E4952FDaB8Cc2DE803fC423aAdBf', // testnet
    abi: StorageRegistryABI,
    functionName: "unitPrice",
  });

  const {
    data: rentTxHash,
    writeContract: write,
    isError: isErrorWrite,
    error: errorWrite,
  } = useWriteContract();

  const { isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
    // chainId: 420, // testnet
    hash: rentTxHash,
  });

  const rentStorageUnit = async () => {
    if (isErrorPriceRead) {
      toast.error("Cannot rent a storage unit", {
        description: errorPriceRead?.message,
      });
      return;
    }
    if (isErrorWrite) {
      toast.error("Cannot rent a storage unit", {
        description: errorWrite?.message,
      });
      return;
    }

    write({
      address: "0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d", // mainnet
      // address: '0xa6B79d91FAD0E4952FDaB8Cc2DE803fC423aAdBf', // testnet
      abi: StorageRegistryABI,
      functionName: "rent",
      args: [fid, 1],
      value: BigInt(price),
    });
  };

  useEffect(() => {
    if (unitPrice) {
      setPrice(Math.floor(Number(unitPrice) * 1.1));
    }
  }, [unitPrice]);

  useEffect(() => {
    if (isSuccess && !hasStorage) {
      toast.success(`Storage unit rented!`);
      setHasStorage(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!!rentTxHash) {
      setRentTxHash(rentTxHash);
    }
  }, [rentTxHash]);

  return (
    <button
      disabled={!isConnected || !fid || hasStorage}
      onClick={() => rentStorageUnit()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        hasStorage && "!bg-green-500 !text-white"
      }`}
    >
      {hasStorage ? (
        <CheckCircleIcon className="w-5 h-5" />
      ) : (
        <div className="inline-flex justify-center items-center gap-x-2">
          <PuffLoader color="#ffffff" size={20} loading={isLoading} />
          Rent
        </div>
      )}
    </button>
  );
}
