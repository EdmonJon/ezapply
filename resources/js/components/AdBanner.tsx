import React, { useState } from "react";
import { X } from "lucide-react";

interface Ad {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    file_type: string;
    placement: string;
}

interface AdBannerProps {
    ads: Ad[];
    placement: string;
    className?: string;
}

export default function AdBanner({ ads, placement, className = "" }: AdBannerProps) {
    const [dismissed, setDismissed] = useState<number[]>([]);

    const filtered = ads.filter(
        (ad) => ad.placement === placement && !dismissed.includes(ad.id)
    );

    if (filtered.length === 0) return null;

    const renderAdContent = (ad: Ad) => {
        if (ad.file_type === "video") {
            return (
                <video
                    src={`/storage/${ad.file_path}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full max-h-64 object-cover"
                />
            );
        }

        if (ad.file_type === "pdf") {
            return (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 text-center">
                    <p className="font-semibold text-gray-800 text-lg">{ad.title}</p>
                    {ad.description && (
                        <p className="text-gray-600 text-sm mt-1">{ad.description}</p>
                    )}
                    <a href={`/storage/${ad.file_path}`} target="_blank" rel="noreferrer" className="mt-3 inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View Details
                    </a>
                </div>
            );
        }

        return (
            <div className="relative">
                <img
                    src={`/storage/${ad.file_path}`}
                    alt={ad.title}
                    className="w-full max-h-64 object-cover"
                />
                {(ad.title || ad.description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-semibold">{ad.title}</p>
                        {ad.description && (
                            <p className="text-white/80 text-xs mt-0.5">{ad.description}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {filtered.map((ad) => (
                <div
                    key={ad.id}
                    className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white"
                >
                    <button
                        onClick={() => setDismissed((prev) => [...prev, ad.id])}
                        className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                        title="Close ad"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    <div className="absolute top-2 left-2 z-10">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Sponsored
                        </span>
                    </div>
                    {renderAdContent(ad)}
                </div>
            ))}
        </div>
    );
}