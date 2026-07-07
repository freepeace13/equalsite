<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CreateAudit;
use App\Actions\Auth\CreateMagicLinkUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Audit\AuditCreateRequest;
use Illuminate\Support\Facades\Auth;

class RequestController extends Controller
{
    public function __invoke(AuditCreateRequest $request, CreateAudit $creator, CreateMagicLinkUser $createMagicLinkUser)
    {
        $userId = null;

        if ($request->filled('email')) {
            $user = $createMagicLinkUser->handle($request->string('email')->toString());

            Auth::login($user);

            $userId = $user->id;
        }

        $audit = $creator->create($request->url, [
            ...$request->only(['crawlDepth', 'include', 'exclude', 'sameDomain']),
            'userId' => $userId,
        ]);

        return redirect()->route('audit.progress', [
            'id' => $audit->crawler_id,
        ]);
    }
}
