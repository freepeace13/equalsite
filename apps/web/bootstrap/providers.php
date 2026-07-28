<?php

use App\Providers\AppServiceProvider;
use App\Providers\AuditArtifactsServiceProvider;
use App\Providers\EventServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\HorizonServiceProvider;
use App\Providers\SpiderServiceProvider;

return [
    AppServiceProvider::class,
    AuditArtifactsServiceProvider::class,
    EventServiceProvider::class,
    FortifyServiceProvider::class,
    HorizonServiceProvider::class,
    SpiderServiceProvider::class,
];
