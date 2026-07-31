<?php

use App\Contracts\Spider;
use App\Exceptions\Spider\SpiderUnavailableException;
use Illuminate\Http\Client\ConnectionException;

test('healthcheck returns the crawler service data when it is reachable', function () {
    test()->mock(Spider::class)
        ->shouldReceive('healthcheck')
        ->once()
        ->andReturn(['ok' => true, 'artifactStorage' => ['ok' => true]]);

    $this->get('/healthcheck')
        ->assertOk()
        ->assertJson(['ok' => true, 'artifactStorage' => ['ok' => true]]);
});

test('healthcheck responds with a 503 when the crawler service cannot be reached', function () {
    test()->mock(Spider::class)
        ->shouldReceive('healthcheck')
        ->once()
        ->andThrow(SpiderUnavailableException::fromConnectionFailure(
            new ConnectionException('Connection refused', 0, null)
        ));

    $this->get('/healthcheck')
        ->assertStatus(503)
        ->assertJson(['ok' => false]);
});
