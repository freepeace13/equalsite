<?php

use App\Http\Controllers\Audit\CancelController;
use App\Http\Controllers\Audit\ExportMarkdownController;
use App\Http\Controllers\Audit\IndexController as AuditIndexController;
use App\Http\Controllers\Audit\ProgressController;
use App\Http\Controllers\Audit\ShowController as AuditShowController;
use App\Http\Controllers\Audit\StoreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Sites\IndexController;
use App\Http\Controllers\Sites\ShowController;
use Illuminate\Support\Facades\Route;

// The MVP routes — also named 'home' so Fortify logout/redirect targets resolve
Route::get('/', HomeController::class)->name('audit.create');
Route::redirect('/home', '/')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/audit', AuditIndexController::class)->name('audit.index');
    Route::get('/sites', IndexController::class)->name('sites.index');
    Route::get('/sites/{domain}', ShowController::class)->name('sites.show');
    Route::post('/audit', StoreController::class)
        ->middleware('throttle:audit-submission')
        ->name('audit.store');
    Route::delete('/audit/{id}', CancelController::class)->name('audit.cancel');
    Route::get('/audit/{id}/progress', ProgressController::class)->name('audit.progress');
    Route::get('/audit/{id}/export-markdown', ExportMarkdownController::class)->name('audit.export-markdown');
    Route::get('/audit/{id}', AuditShowController::class)->name('audit.show');
});
