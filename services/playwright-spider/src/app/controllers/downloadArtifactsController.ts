import type { DownloadArtifactParams } from "@equalsite/types";
import type { Request, Response } from "express";
import * as Config from '../../config';
import { createArtifactService } from "../../audit/services/artifactService";

const { artifactDirectory, archiveDirectory } = Config.crawler;
const artifactService = createArtifactService(artifactDirectory, archiveDirectory);

export const DownloadArtifactsController = async (
    request: Request<DownloadArtifactParams>,
    response: Response
) => {
    const { auditId } = request.params;
    const zippedFile = await artifactService.zippedFile(auditId);

    return response.download(zippedFile, (err) => {
        if (err) {
            console.error('Error during file transfer:', err);
            if (!response.headersSent) {
                return response.status(500).send('Could not download file.');
            }
        } else {
            console.log('Download complete. Proceeding to delete file...');
            void artifactService.cleanup(auditId);
        }
    })
}
