<?php

namespace App\Http\Requests\Audit;

use Illuminate\Foundation\Http\FormRequest;

class AuditCreateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'url' => ['required', 'active_url'],
            'crawlDepth' => ['sometimes', 'integer', 'in:1,3,5'],
            'include' => ['sometimes', 'nullable', 'string', 'max:500'],
            'exclude' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sameDomain' => ['sometimes', 'boolean'],
            'email' => ['sometimes', 'nullable', 'email'],
        ];
    }
}
