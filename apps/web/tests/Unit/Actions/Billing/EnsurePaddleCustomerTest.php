<?php

use App\Actions\Billing\EnsurePaddleCustomer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Paddle\Customer;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('returns the existing paddle customer without calling the Paddle API', function () {
    Http::fake(); // any request at all fails this test via assertNothingSent()

    $user = User::factory()->create();
    $customer = Customer::create([
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'paddle_id' => 'ctm_existing',
        'name' => $user->name,
        'email' => $user->email,
    ]);

    $result = (new EnsurePaddleCustomer)->handle($user->fresh());

    expect($result->paddle_id)->toBe($customer->paddle_id);
    Http::assertNothingSent();
});

test('creates a paddle customer via the API when the user has none yet', function () {
    Http::fake([
        '*/customers*' => Http::response(['data' => [
            'id' => 'ctm_new',
            'name' => 'Jamie',
            'email' => 'jamie@example.com',
        ]]),
    ]);

    $user = User::factory()->create(['name' => 'Jamie', 'email' => 'jamie@example.com']);

    $result = (new EnsurePaddleCustomer)->handle($user);

    expect($result->paddle_id)->toBe('ctm_new');
    $this->assertDatabaseHas('customers', [
        'billable_id' => $user->id,
        'billable_type' => User::class,
        'paddle_id' => 'ctm_new',
    ]);
});
