<?php

use App\Http\Controllers\Audit\CancelController;
use App\Http\Controllers\Audit\ProgressController;
use App\Http\Controllers\Audit\RequestController;
use App\Http\Controllers\Audit\ResultController;
use App\Http\Controllers\Auth\MagicLinkLoginController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Sites\IndexController;
use App\Http\Controllers\Sites\ShowController;
use Illuminate\Support\Facades\Route;

// The MVP routes — also named 'home' so Fortify logout/redirect targets resolve
Route::get('/', HomeController::class)->name('audit.create');
Route::redirect('/home', '/')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/audit', 'audit/lobby')->name('audit.index');
    Route::get('/sites', IndexController::class)->name('sites.index');
    Route::get('/sites/{domain}', ShowController::class)->name('sites.show');
    Route::post('/audit', RequestController::class)->name('audit.store');
    Route::delete('/audit/{id}', CancelController::class)->name('audit.cancel');
    Route::get('/audit/{id}', ProgressController::class)->name('audit.progress');
    Route::get('/audit/{id}/result', ResultController::class)->name('audit.result');
});

Route::get('magic-link/{user}', MagicLinkLoginController::class)
    ->middleware('signed')
    ->name('magic-link.login');
