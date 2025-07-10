import { Search, Filter, Calendar, Download } from "lucide-react";

interface Props {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  selectedTypes: Set<string>;
  setSelectedTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
  exportCSV: () => void;
}

type DateRange = {
  start: string;
  end: string;
};
export default function ActionBar({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  selectedTypes,
  setSelectedTypes,
  exportCSV,
}: Props) {
  const toggleType = (type: string) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const typeColors: { [key: string]: string } = {
    payment: "bg-blue-100 text-blue-800",
    mint: "bg-green-100 text-green-800",
    canvas_publish: "bg-purple-100 text-purple-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by hash, address or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
          <button
            onClick={() => setDateRange({ start: "", end: "" })}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            All Time
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={exportCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Transaction Type Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center mr-2">
          <Filter className="h-5 w-5 mr-1 text-gray-500" />
          <span className="text-gray-600">Filter by:</span>
        </div>

        <button
          onClick={() => toggleType("payment")}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedTypes.has("payment")
              ? typeColors.payment
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Payments
        </button>

        <button
          onClick={() => toggleType("mint")}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedTypes.has("mint")
              ? typeColors.mint
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Mints
        </button>

        <button
          onClick={() => toggleType("canvas_publish")}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedTypes.has("canvas_publish")
              ? typeColors.canvas_publish
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Canvas Publishes
        </button>

        <button
          onClick={() => toggleType("pending")}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedTypes.has("pending")
              ? typeColors.pending
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Pending
        </button>
      </div>
    </div>
  );
}
