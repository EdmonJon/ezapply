import { Pagination } from "@/types/pagination";
import { Button } from '@/components/ui/button';
import { Link } from "@inertiajs/react";
import { link } from "fs";

export default function TablePagination({links, total, to, from}: Pagination){
    return (
        <div className="flex flex-row items-center justify-between gap-4 border-t bg-white px-8 pt-5 dark:bg-gray-800">
            <div className="flex items-center">
                <span className="text-sm text-muted-foreground">
                    Showing {from} to {to} of {total} results
                </span>
            </div>
            {/* Pagination links can be added here if needed */}
            <div className="flex items-center space-x-2 mb-2">
                {links.map((link, index) => (
                    link.url != null ? (
                        <Link href={link.url || '#'} key={index}>
                            <Button variant={'outline'} size={'sm'} disabled={!link.url} dangerouslySetInnerHTML={{__html:link.label}} />
                        </Link>
                    ) : (
                        <Button key={index} variant={'outline'} size={'sm'} disabled dangerouslySetInnerHTML={{__html:link.label}} />
                    )
                ))

                }
            </div>
        </div>
        
    )
}