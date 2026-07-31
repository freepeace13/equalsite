import { Router } from "express";
import { validationMiddleware } from '../app/middleware/validationMiddleware';
import { cancelAuditValidationRules, createAuditValidationRules } from '../app/validators/auditValidators';
import { CreateAuditController } from "../app/controllers/createAuditController";
import { CancelAuditController } from "../app/controllers/cancelAuditController";
import { HealthcheckController } from "../app/controllers/healthcheckController";

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

router.get('/healthcheck', HealthcheckController);

export default router;
