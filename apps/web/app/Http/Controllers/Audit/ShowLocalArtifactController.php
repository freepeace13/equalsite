<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShowLocalArtifactController extends Controller
{
    public function __invoke(Request $request)
    {
        abort_unless($request->hasValidSignature(), 403);

        $path = $request->query('path');

        abort_unless(is_string($path) && Storage::disk('audit_artifacts')->exists($path), 404);

        return Storage::disk('audit_artifacts')->response($path);
    }
}
