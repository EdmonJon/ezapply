import { Wallet } from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import { usePage } from "@inertiajs/react";
import { SharedData } from "@/types";

type BalanceDisplayProps = {
    isCollapsed: boolean;
};

export default function BalanceDisplay({ isCollapsed }: BalanceDisplayProps) {
    const { props } = usePage<SharedData>();
    const credits = props.auth.user?.credits ?? 0;

    return (
        <PermissionGate role="company">
            {isCollapsed ? (
                <div className="flex items-center space-x-1 bg-blue-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-lg border border-blue-300 dark:border-neutral-700 shadow-sm">
                    <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        ez {credits}
                    </span>
                </div>
            ) : (
                <div className="flex items-center space-x-2 bg-blue-100 dark:bg-neutral-800 px-4 py-2 rounded-lg border border-blue-300 dark:border-neutral-700 shadow-sm">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-base font-semibold text-blue-700 dark:text-blue-300">
                        ez {credits}
                    </span>
                </div>
            )}
        </PermissionGate>
    );
}