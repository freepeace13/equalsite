<?php

namespace App\Actions\User;

use App\Models\User;

class GenerateUserDataExport
{
    /**
     * @return array<string, mixed>
     */
    public function generate(User $user): array
    {
        return [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'plan' => $user->plan->value,
                'created_at' => $user->created_at->toIso8601String(),
            ],
            'audits' => $user->audits->map(fn ($audit) => [
                'url' => $audit->url,
                'domain' => $audit->domain,
                'status' => $audit->status->value,
                'completed_at' => $audit->completed_at?->toIso8601String(),
                'violations' => $audit->violations->map(fn ($violation) => [
                    'rule_id' => $violation->rule_id,
                    'impact' => $violation->impact_level->value,
                    'description' => $violation->description,
                ])->all(),
            ])->all(),
        ];
    }
}
