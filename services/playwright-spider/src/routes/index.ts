import { Router } from "express";
import * as Config from '../config';
import * as AuditController from '../app/controllers/auditController';
import { validationMiddleware } from '../app/middleware/validationMiddleware';
import { cancelAuditValidationRules, createAuditValidationRules } from '../app/validators/auditValidators';

const router: Router = Router();

router.post('/audit', validationMiddleware(createAuditValidationRules), AuditController.CreateAudit);
router.delete('/audit/:auditId', validationMiddleware(cancelAuditValidationRules), AuditController.CancelAudit);
router.get('/ping', (req, res) => {
    console.log(Config);
    res.json({ ok: true });
});

export default router;
