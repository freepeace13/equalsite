<?php

use App\Http\Controllers\Api\CrawlerCallbackController;
use App\Http\Middleware\CrawlerMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/crawler/callback', CrawlerCallbackController::class)
    ->middleware(CrawlerMiddleware::class)
    ->name('api.crawler.callback');
