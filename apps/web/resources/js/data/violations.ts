import type { Violation } from '@/types';

export const mockViolations: Violation[] = [
    {
        auditId: 'sample-unique-uuid',
        ruleId: 'aria-hidden-focus',
        impactLevel: 'serious',
        description:
            'Ensure aria-hidden elements are not focusable nor contain focusable elements',
        translatedDescription: undefined,
        failureSummary:
            'Fix all of the following: Focusable content should be disabled or be removed from the DOM',
        translatedFailureSummary: undefined,
        helpUrl:
            'https://dequeuniversity.com/rules/axe/4.11/aria-hidden-focus?application=playwright',
        totalAffectedUrls: 3,
        totalUniqueInstances: 1,
        instances: [
            {
                fingerprint: '41deeb77634d566ed8c98c8d540afb7d',
                html: '<input type="checkbox" id="mobile-menu-toggle" class="mobile-menu-toggle sr-only" aria-hidden="true">',
                target: '#mobile-menu-toggle',
                affectedUrls: [
                    'https://marketdragon.ph/features/ai-assistant',
                    'https://marketdragon.ph/features/ai-assistant-1',
                    'https://marketdragon.ph/features/ai-assistant-3',
                ],
            },
        ],
    },
];
