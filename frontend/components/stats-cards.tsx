import { Card } from "@/components/ui/card";
import { SearchResponse } from "@/types/lead";

type Props = {
  data: SearchResponse | null;
};

export default function StatsCards({
  data,
}: Props) {

  const results = data?.results ?? [];

  return (
    <div className="grid gap-5 md:grid-cols-4">

      <Card className="p-5">
        <p className="text-sm text-gray-500">
          Total Leads
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {results.length}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">
          Websites
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {results.filter(x => x.website).length}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">
          Phones
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {results.filter(x => x.phone).length}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-gray-500">
          Emails
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {results.filter(x => x.email).length}
        </h2>
      </Card>

    </div>
  );
}