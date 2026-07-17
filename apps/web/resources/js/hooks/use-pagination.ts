import { useMemo, useState } from 'react';

export default function usePagination<T = unknown>(
    data: T[],
    perPage: number = 10,
) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(
        () => Math.ceil(data.length / perPage),
        [data.length, perPage],
    );

    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, perPage]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    const totalItems = data.length;
    const lastPage = currentPage === totalPages;
    const firstPage = currentPage === 1;

    return {
        lastPage,
        firstPage,
        totalItems,
        currentItems,
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        perPage,
    };
}
