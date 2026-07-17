import { Router } from "express";
import { validationMiddleware } from '../app/middleware/validationMiddleware';
import { cancelAuditValidationRules, createAuditValidationRules } from '../app/validators/auditValidators';
import { CreateAuditController } from "../app/controllers/createAuditController";
import { CancelAuditController } from "../app/controllers/cancelAuditController";
import { DownloadArtifactsController } from "../app/controllers/downloadArtifactsController";

const router: Router = Router();

router.post(
    '/audit',
    validationMiddleware(createAuditValidationRules),
    CreateAuditController
);

router.delete(
    '/audit/:auditId',
    validationMiddleware(cancelAuditValidationRules),
    CancelAuditController
);

router.get('/download/:auditId', DownloadArtifactsController);

router.get('/ping', (req, res) => {
    res.json({ ok: true });
});

export default router;
