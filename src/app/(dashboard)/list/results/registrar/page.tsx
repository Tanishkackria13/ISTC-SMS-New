"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Result {
  teacherId: string;
  teacherName: string;
  subjectName: string;
  verified: boolean;
}

export default function RegistrarResultsPage() {
  const [results, setResults] = useState<
    Record<string, { teacherName: string; subjects: Record<string, boolean> }>
  >({});
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/results/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((data: Result[]) => {
        console.log("Fetched data:", data);

        const groupedResults: Record<
          string,
          { teacherName: string; subjects: Record<string, boolean> }
        > = {};

        data.forEach((res) => {
          if (!groupedResults[res.teacherId]) {
            groupedResults[res.teacherId] = {
              teacherName: res.teacherName,
              subjects: {},
            };
          }
          groupedResults[res.teacherId].subjects[res.subjectName] =
            res.verified;
        });

        setResults(groupedResults);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setLoading(false);
      });
  }, []);

  const handleVerifyClick = (teacherId: string, subjectName: string) => {
    setSelectedTeacher(teacherId);
    setSelectedSubject(subjectName);
    setShowConfirm(true);
  };

  const handleVerify = async () => {
    if (!selectedTeacher || !selectedSubject) return;

    try {
      const res = await fetch("/api/results/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          subjectName: selectedSubject,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify results");
      }

      setResults((prevResults) => {
        const updatedResults = { ...prevResults };
        if (
          updatedResults[selectedTeacher]?.subjects[selectedSubject] !==
          undefined
        ) {
          updatedResults[selectedTeacher].subjects[selectedSubject] = true;
        }
        return updatedResults;
      });

      setShowConfirm(false);
      setSelectedTeacher(null);
      setSelectedSubject(null);
    } catch (error) {
      console.error("Error verifying results:", error);
    }
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Uploaded Results</h1>
        <Link href={"/list/results/allteachers"}>
          <h1 className="text-xl font-semibold mb-8 mr-20 p-4 border rounded bg-yellow-200">Check the Result List</h1>
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Teacher</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Download</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).length > 0 ? (
            Object.entries(results).flatMap(([teacherId, data]) =>
              Object.entries(data.subjects).map(([subjectName, verified]) => (
                <tr key={`${teacherId}-${subjectName}`} className="border">
                  <td className="border p-2">{data.teacherName}</td>
                  <td className="border p-2">{subjectName}</td>
                  <td
                    className={`border p-2 ${
                      verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {verified ? "Verified" : "Unverified"}
                  </td>
                  <td className="border p-2">
                    <Link
                      href={`/api/results/export?teacherId=${teacherId}&subject=${subjectName}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Download {subjectName} Results (Excel)
                    </Link>
                  </td>
                  <td className="border p-2">
                    {!verified && (
                      <button
                        onClick={() =>
                          handleVerifyClick(teacherId, subjectName)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No results available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Verification</h2>
            <p>
              Are you sure you want to verify the result for {selectedSubject}?
              This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
