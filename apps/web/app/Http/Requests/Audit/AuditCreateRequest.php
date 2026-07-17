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
     * Laravel's standard 403 before CreateAudit ever runs. The target domain
     * is passed through so the site-cap check can tell a re-scan of an
     * already-owned site apart from adding a new one — without it, every
     * account's first completed audit would permanently block all future
     * audits, including legitimate re-scans of that same site.
     */
    public function authorize(): bool
    {
        $domain = $this->filled('url') ? parse_url($this->string('url')->toString(), PHP_URL_HOST) : null;

        return $this->user()->can('create', [Audit::class, $domain]);
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
