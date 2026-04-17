import { Link } from "@inertiajs/react";

type ChatButtonProps = {
  status: string;
  userId?: number;
};

export default function ChatButton({ status, userId }: ChatButtonProps) {
  const isEnabled = status === "approved";

  return (
    <Link
    href={isEnabled && userId ? `/chat/${userId}` : "#"}
    className={`ml-2 flex items-center justify-center h-9 w-9 rounded-full border transition-colors ${
      isEnabled
        ? "hover:bg-blue-100 dark:hover:bg-blue-800 border-blue-300 dark:border-blue-600"
        : "opacity-50 cursor-not-allowed pointer-events-none border-gray-300 dark:border-gray-600"
    }`}
    title={
      isEnabled
        ? "Chat"
        : "Chat disabled (only available if status is approved)"
    }
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${
        isEnabled
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-400 dark:text-gray-500"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 8h10M7 12h4m1 8l-5-5H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 
          2 0 012 2v7a2 2 0 01-2 2h-5l-5 5z"
      />
    </svg>
  </Link>

  );
}
