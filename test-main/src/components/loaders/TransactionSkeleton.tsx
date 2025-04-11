import { useEffect, useState } from "react";

export default function TransactionSkeleton({ rows = 15 }: {rows?: number}) {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;


  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">

          <td className="p-4">
            <div className="h-4 w-6 bg-gray-200 rounded" />
          </td>

          <td className="p-4">
            <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-2 w-24 bg-gray-200 rounded" />
            <div className="h-2 w-28 bg-gray-200 rounded mt-1" />
          </td>

          <td className="p-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </td>

          <td className="p-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </td>

          <td className="p-4 text-right">
            <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
          </td>

          <td className="p-4">
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}
