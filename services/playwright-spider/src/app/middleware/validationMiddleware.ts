import type { RequestHandler } from "express";
import type { ValidationChain } from "express-validator";
import { validationResult } from "express-validator";

export interface NormalizedValidationError {
    field: string;
    message: string;
}

export function validationMiddleware(validations: ValidationChain[]): RequestHandler {
    return async (request, response, next) => {
        await Promise.all(validations.map((validation) => validation.run(request)));

        const result = validationResult(request).formatWith((error) => ({
            field: error.type === 'field' ? error.path : error.type,
            message: normalizeMessage(error.msg),
        }));

        if (result.isEmpty()) {
            return next();
        }

        return response.status(400).json({
            error: 'Invalid request body',
            message: 'The request failed validation.',
            errors: result.array({ onlyFirstError: true }),
        });
    }
}

function normalizeMessage(message: unknown): string {
    const text = typeof message === 'string' && message.trim().length > 0
        ? message.trim()
        : 'Invalid value';

    return text.endsWith('.') ? text : `${text}.`;
}
