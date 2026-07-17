import { body, param } from "express-validator";
import type { ValidationChain } from "express-validator";

export const createAuditValidationRules: ValidationChain[] = [
    body('urls')
        .isArray({ min: 1 })
        .withMessage('urls is required and must be a non-empty array of strings'),
    body('urls.*')
        .isString()
        .withMessage('each url must be a string')
        .bail()
        .isURL()
        .withMessage('each url must be a valid URL'),

    body('options')
        .isObject()
        .withMessage('options is required and must be an object'),
    body('options.maxPages')
        .isInt({ min: 1 })
        .withMessage('options.maxPages is required and must be a positive integer'),
    body('options.enqueueLinks')
        .isBoolean()
        .withMessage('options.enqueueLinks is required and must be a boolean'),
    body('options.enqueueStrategy')
        .isString()
        .withMessage('options.enqueueStrategy is required and must be a string')
        .bail()
        .notEmpty()
        .withMessage('options.enqueueStrategy must not be empty'),
    body('options.maxDepth')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage('options.maxDepth must be a non-negative integer or null'),
    body('options.includeGlobs')
        .optional()
        .isArray()
        .withMessage('options.includeGlobs must be an array of strings'),
    body('options.includeGlobs.*')
        .optional()
        .isString()
        .withMessage('each options.includeGlobs entry must be a string'),
    body('options.excludeGlobs')
        .optional()
        .isArray()
        .withMessage('options.excludeGlobs must be an array of strings'),
    body('options.excludeGlobs.*')
        .optional()
        .isString()
        .withMessage('each options.excludeGlobs entry must be a string'),
];

export const cancelAuditValidationRules: ValidationChain[] = [
    param('auditId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('auditId is required'),
];
