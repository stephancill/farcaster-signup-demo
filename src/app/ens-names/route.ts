import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.toLowerCase();

  const responseJson = await fetch(
    "https://gateway-arbitrum.network.thegraph.com/api/9ad5cff64d93ed2c33d1a57b3ec03ea9/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH",
    {
      headers: {
        "content-type": "application/json",
      },
      body: `{\"query\":\"query getNamesForAddress($orderBy: Domain_orderBy, $orderDirection: OrderDirection, $first: Int, $whereFilter: Domain_filter) {\\n  domains(\\n    orderBy: $orderBy\\n    orderDirection: $orderDirection\\n    first: $first\\n    where: $whereFilter\\n  ) {\\n    ...DomainDetails\\n    registration {\\n      ...RegistrationDetails\\n    }\\n    wrappedDomain {\\n      ...WrappedDomainDetails\\n    }\\n  }\\n}\\n\\nfragment DomainDetails on Domain {\\n  ...DomainDetailsWithoutParent\\n  parent {\\n    name\\n    id\\n  }\\n}\\n\\nfragment DomainDetailsWithoutParent on Domain {\\n  id\\n  labelName\\n  labelhash\\n  name\\n  isMigrated\\n  createdAt\\n  resolvedAddress {\\n    id\\n  }\\n  owner {\\n    id\\n  }\\n  registrant {\\n    id\\n  }\\n  wrappedOwner {\\n    id\\n  }\\n}\\n\\nfragment RegistrationDetails on Registration {\\n  registrationDate\\n  expiryDate\\n}\\n\\nfragment WrappedDomainDetails on WrappedDomain {\\n  expiryDate\\n  fuses\\n}\",\"variables\":{\"orderBy\":\"expiryDate\",\"orderDirection\":\"asc\",\"first\":20,\"whereFilter\":{\"and\":[{\"or\":[{\"owner\":\"${address}\"},{\"registrant\":\"${address}\"},{\"wrappedOwner\":\"${address}\"}]},{\"parent_not\":\"0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2\"},{\"or\":[{\"expiryDate_gt\":\"${Math.round(
        Date.now() / 1000
      )}\"},{\"expiryDate\":null}]},{\"or\":[{\"owner_not\":\"0x0000000000000000000000000000000000000000\"},{\"resolver_not\":null},{\"and\":[{\"registrant_not\":\"0x0000000000000000000000000000000000000000\"},{\"registrant_not\":null}]}]}]}},\"operationName\":\"getNamesForAddress\"}`,
      method: "POST",
    }
  ).then((response) => response.json());

  const names = responseJson.data.domains.map((domain: any) => domain.name);

  return Response.json(names);
}
