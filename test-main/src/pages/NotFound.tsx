import { useLocation, useNavigate } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-2">
        Oops! The URL{" "}
        <span className="font-mono bg-gray-200 px-2 py-1 rounded">
          {location.pathname}
        </span>{" "}
        doesn't exist.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-blue-600 transition cursor-pointer"
      >
        Go Back
      </button>
    </div>
  );
}
