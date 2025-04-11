type ErrorMessageProps = {
    title?: string;
    message?: string;
    statusCode?: number;
  };
  
  export default function ErrorMessage({
    title = "Oops! Something went wrong.",
    message = "An unexpected error occurred while loading the data.",
    statusCode,
  }: ErrorMessageProps) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-6">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {statusCode ? `Error ${statusCode}` : "Error"}
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-400">We're sorry for the inconvenience.</p>
        </div>
      </div>
    );
  }
  