import fs from 'node:fs';

export async function deleteDirectoryIfExists(
    dir: string
): Promise<void> {
    if (fs.existsSync(dir)) {
        await fs.promises.rm(
            dir,
            {
                recursive: true,
                force: true,
            },
        );
    }
}
