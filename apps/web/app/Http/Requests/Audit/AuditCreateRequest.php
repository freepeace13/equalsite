<?php

namespace App\Http\Requests\Audit;

use App\Models\Audit;
use App\Value\CrawlDepth;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AuditCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Gating AuditPolicy::create() here (rather than leaving it to be called
     * manually in the controller) means a denied request short-circuits with
     * Laravel's standard 403 before CreateAudit ever runs. This only covers
     * the one-audit-in-flight rule — the site cap and re-scan-frequency rule
     * are checked later in CreateAudit, since those need to surface a
     * specific message rather than a bare 403.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Audit::class);
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
