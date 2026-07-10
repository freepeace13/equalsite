<?php

namespace App\Casts;

use App\Support\NodeCollection;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsNodeCollection implements CastsAttributes
{
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes
    ): NodeCollection {
        return new NodeCollection(json_decode($value, true));
    }

    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes
    ): string {
        return json_encode($value);
    }
}
