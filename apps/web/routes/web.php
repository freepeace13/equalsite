<?php

use App\Http\Controllers\Audit\CancelController;
use App\Http\Controllers\Audit\ProgressController;
use App\Http\Controllers\Audit\RequestController;
use App\Http\Controllers\Audit\ResultController;
use Illuminate\Support\Facades\Route;

// The MVP routes — also named 'home' so Fortify logout/redirect targets resolve
Route::inertia('/', 'audit/index')->name('audit.create');
Route::redirect('/dashboard', '/')->name('dashboard');
Route::redirect('/home', '/')->name('home');
Route::inertia('/audit', 'audit/lobby')->name('audit.index');
Route::post('/audit', RequestController::class)->name('audit.store');
Route::delete('/audit/{id}', CancelController::class)->name('audit.cancel');
Route::get('/audit/{id}', ProgressController::class)->name('audit.progress');
Route::get('/audit/{id}/result', ResultController::class)->name('audit.result');
