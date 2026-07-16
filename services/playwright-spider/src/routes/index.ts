import { Router } from "express";
import * as Config from '../config';
import { validationMiddleware } from '../app/middleware/validationMiddleware';
import { cancelAuditValidationRules, createAuditValidationRules } from '../app/validators/auditValidators';
import { CreateAuditController } from "../app/controllers/createAuditController";
import { CancelAuditController } from "../app/controllers/cancelAuditController";

const router: Router = Router();

router.post('/audit', validationMiddleware(createAuditValidationRules), CreateAuditController);
router.delete('/audit/:auditId', validationMiddleware(cancelAuditValidationRules), CancelAuditController);
router.get('/ping', (req, res) => {
    console.log(Config);
    res.json({ ok: true });
});

export default router;
