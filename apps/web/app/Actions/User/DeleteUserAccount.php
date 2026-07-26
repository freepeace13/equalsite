<?php

namespace App\Actions\User;

use App\Contracts\ArtifactRepository;
use App\Models\User;

class DeleteUserAccount
{
    public function __construct(protected ArtifactRepository $artifacts) {}

    public function delete(User $user): void
    {
        foreach ($user->audits as $audit) {
            $this->artifacts->delete($audit->crawler_id);
        }

        // audits/audit_pages/audit_violations rows cascade at the DB level
        // via their foreign keys — deleting the user is sufficient for them.
        $user->delete();
    }
}
