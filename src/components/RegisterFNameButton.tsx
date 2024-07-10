import {
  FarcasterNetwork,
  Message,
  NobleEd25519Signer,
  UserDataType,
  makeUserDataAdd,
  makeUserNameProofClaim,
} from "@farcaster/hub-web";

import { useSigner } from "@/providers/signerContext";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useSignTypedData,
  useSwitchChain,
} from "wagmi";

import { useFid } from "@/providers/fidContext";
import { toast } from "sonner";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import PuffLoader from "react-spinners/PuffLoader";
import { createPublicClient, http, verifyTypedData } from "viem";
import { mainnet, optimism } from "viem/chains";

export const EIP_712_USERNAME_DOMAIN = {
  name: "Farcaster name verification",
  version: "1",
  chainId: 1,
  verifyingContract: "0xe3be01d99baa8db9905b33a3ca391238234b79d1", // name registry contract, will be the farcaster ENS CCIP contract later
} as const;

export const EIP_712_USERNAME_PROOF = [
  { name: "name", type: "string" },
  { name: "timestamp", type: "uint256" },
  { name: "owner", type: "address" },
] as const;

export const USERNAME_PROOF_EIP_712_TYPES = {
  domain: EIP_712_USERNAME_DOMAIN,
  types: { UserNameProof: EIP_712_USERNAME_PROOF },
} as const;

export default function RegisterFnameButton({
  fname,
  disableFname,
  setDisableFname,
}: {
  fname: string;
  disableFname: boolean;
  setDisableFname: (value: boolean) => void;
}) {
  const { signer } = useSigner();
  const { address, isConnected } = useAccount();
  const { fid } = useFid();
  const [isLoading, setIsLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(
    Math.floor(Date.now() / 1000)
  );

  const {
    data: signature,
    isError,
    error: errorSign,
    isSuccess: isSuccessSign,
    signTypedData,
  } = useSignTypedData();

  const {
    isSuccess: isSuccessSwitch,
    switchChain,
    switchChainAsync,
    data: pendingChainId,
  } = useSwitchChain();

  const chainId = useChainId();

  useEffect(() => {
    console.log("chainId", chainId);
  }, [chainId]);

  const registerFname = async () => {
    if (fname.length === 0) {
      toast.error("fname can't be empty");
      return;
    }
    if (isError) {
      toast.error("Error registering fname", {
        description: errorSign?.message,
      });
      return;
    }

    console.log("chainId", chainId);

    if (chainId !== 10) {
      await switchChainAsync({ chainId: 10 });
      return;
    }

    setIsLoading(true);
    const claim = makeUserNameProofClaim({
      name: fname,
      timestamp: timestamp,
      owner: address?.toLowerCase() as `0x${string}`,
    });

    console.log("claim", claim);

    signTypedData({
      ...USERNAME_PROOF_EIP_712_TYPES,
      primaryType: "UserNameProof",
      message: claim,
    });
  };

  const setFnameAsPrimary = async () => {
    if (!fid) {
      toast.error("FID not found");
      return;
    }

    const dataOptions = {
      fid: fid,
      network: FarcasterNetwork.MAINNET,
    };

    const userDataAddBody = {
      type: UserDataType.USERNAME,
      value: fname,
    };

    const message = await makeUserDataAdd(
      userDataAddBody,
      dataOptions,
      signer as NobleEd25519Signer
    );

    if (message) {
      axios
        .post("/hub", {
          message: Message.toJSON(message.unwrapOr(null) as Message),
        })
        .then((res) => {
          toast.success("fname registered");
          setDisableFname(true);
        })
        .catch((err) => {
          toast.error("Failed to register fname", {
            description: err.response.data,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log("Failed to create message");
    }
  };

  useEffect(() => {
    if (isSuccessSign && address) {
      const body = {
        name: fname, // Name to register
        from: 0, // Fid to transfer from (0 for a new registration)
        to: fid, // Fid to transfer to (0 to unregister)
        fid: fid, // Fid making the request (must match from or to)
        owner: address, // Custody address of fid making the request
        timestamp: timestamp, // Current timestamp in seconds
        signature: signature, // EIP-712 signature signed by the custody address of the fid
      };

      // const client = createPublicClient({
      //   chain: optimism,
      //   transport: http(),
      // });

      // client
      //   .verifyTypedData({
      //     ...USERNAME_PROOF_EIP_712_TYPES,
      //     primaryType: "UserNameProof",
      //     message: {
      //       name: fname,
      //       timestamp: timestamp,
      //       owner: address?.toLowerCase(),
      //     },
      //     signature: signature,
      //     address: address,
      //   })
      //   .then((result) => {
      //     console.log("verifyResult", result);
      //   });

      // verifyTypedData({
      //   ...USERNAME_PROOF_EIP_712_TYPES,
      //   primaryType: "UserNameProof",
      //   message: {
      //     name: fname,
      //     timestamp: BigInt(timestamp),
      //     owner: address?.toLowerCase() as `0x${string}`,
      //   },
      //   signature: signature,
      //   address: address,
      // })
      //   .then((result) => {
      //     console.log("verifyResult raw", result);
      //   })
      //   .catch((error) => {
      //     console.error("verifyResult raw error", error);
      //   });

      axios
        .post("https://fnames.farcaster.xyz/transfers", body)
        .then((response) => {
          setFnameAsPrimary();
        })
        .catch((error) => {
          console.error(error, error.response.data);
          toast.error("Failed to register fname", {
            description: error.response.data.code,
          });
        })
        .finally(() => {
          setIsLoading(false);
          switchChain({ chainId: 10 }); // mainnet
          // switchNetwork?.(420) // testnet
        });
    }
  }, [isSuccessSign]);

  return (
    <button
      disabled={!isConnected || !fid || !signTypedData || disableFname}
      onClick={() => registerFname()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        disableFname && "!bg-green-500 !text-white"
      }`}
    >
      <PuffLoader color="#ffffff" size={20} loading={isLoading} />
      {disableFname ? <CheckCircleIcon className="w-5 h-5" /> : "Register"}
    </button>
  );
}
