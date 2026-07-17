export const omit = (obj: object, keysToOmit: string[]) => {
    const keysSet = new Set(keysToOmit);
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keysSet.has(key)),
    );
};
