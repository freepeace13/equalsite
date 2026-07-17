<?php

namespace App\Http\Requests\Audit;

use App\Value\CrawlDepth;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AuditCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Always true: every create-time business rule (one-audit-in-flight,
     * site cap, re-scan frequency) is enforced in CreateAudit instead, since
     * all three need to surface a specific, helpful message rather than a
     * bare 403 — see CreateAudit::assertRescanAllowed() and
     * ::assertSiteCapAllowed().
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'url' => ['required', 'active_url'],
            'crawlDepth' => ['sometimes', new Enum(CrawlDepth::class)],
            'include' => ['sometimes', 'nullable', 'string', 'max:500'],
            'exclude' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sameDomain' => ['sometimes', 'boolean'],
            'stayOnPage' => ['sometimes', 'boolean'],
        ];
    }
}
