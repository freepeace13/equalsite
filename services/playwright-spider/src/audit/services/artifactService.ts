import fs from 'node:fs';
import path from 'node:path';
import { deleteDirectoryIfExists, deleteFileIfExists, zipDirectory } from '../utils/fsDirectory';

export const createArtifactService = (
    artifactDirectory: string,
    archiveDirectory: string
) => {
    const directoryPath = (auditId: string) => {
        return path.join(artifactDirectory, auditId);
    }

    const zippedPath = (auditId: string) => {
        return path.join(archiveDirectory, `${auditId}.zip`);
    }

    const compress = async (auditId: string) => {
        const source = directoryPath(auditId);
        const result = await zipDirectory(source, zippedPath(auditId));
        await deleteDirectoryIfExists(source);
        return result.path;
    }

    const cleanup = async (auditId: string) => {
        await deleteDirectoryIfExists(directoryPath(auditId));
        deleteFileIfExists(zippedPath(auditId));
    }

    const zippedFile = (auditId: string) => {
        const zipPath = zippedPath(auditId);
        if (fs.existsSync(zipPath)) {
            return zipPath;
        }

        if (fs.existsSync(directoryPath(auditId))) {
            return compress(auditId);
        }

        throw new Error('Missing artifacts download.');
    }

    return {
        zippedFile,
        cleanup,
        compress,
        zippedPath,
        directoryPath
    };
}
