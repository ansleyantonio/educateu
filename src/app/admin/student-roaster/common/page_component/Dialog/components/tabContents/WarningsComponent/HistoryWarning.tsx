"use client";
import { Card } from "@/components/ui/card";

const warnings = [
  {
    title: "Academic Misconduct",
    message: "Suspected plagiarism in assignment submission",
    sender: "Prof. Michael Brown",
    date: "3/10/2024, 9:30:00 AM",
    severity: "High",
    status: "Active",
    severityColor: "bg-red-100 text-red-700",
    statusColor: "bg-red-100 text-red-700",
  },
  {
    title: "Academic Performance",
    message: "GPA below minimum requirement threshold",
    sender: "Dr. Sarah Johnson",
    date: "2/15/2024, 2:20:00 PM",
    severity: "Medium",
    status: "Resolved",
    severityColor: "bg-yellow-100 text-yellow-700",
    statusColor: "bg-green-100 text-green-700",
  },
];

const HistoryWarning = () => {
  return (
    <Card className="mt-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-md">Warning History</h3>
      </div>

      {warnings.map((warning, index) => (
        <Card key={index} className="p-4 mb-4 border rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-semibold">{warning.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{warning.message}</p>

              <p className="mt-3 text-xs text-muted-foreground">
                Sent by: <span className="font-semibold text-gray-800">{warning.sender}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Date: <span>{warning.date}</span>
              </p>
            </div>

            <div className="flex gap-2 items-end">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${warning.severityColor}`}
              >
                {warning.severity}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${warning.statusColor}`}
              >
                {warning.status}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </Card>
  );
};

export default HistoryWarning;