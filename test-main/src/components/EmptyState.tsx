import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
}

export default function EmptyState({ icon , title, message }: EmptyStateProps) {
  return (
    <div className="h-[44vh] flex flex-col items-center justify-center px-4 py-16 text-center text-gray-500 animate-fadeIn">
      {icon && <div className="text-5xl mb-6 opacity-60">{icon}</div>}
      <h2 className="text-2xl font-medium text-gray-800 mb-3">{title}</h2>
      <p className="text-base text-gray-400 max-w-md">{message}</p>
    </div>
  );
}
