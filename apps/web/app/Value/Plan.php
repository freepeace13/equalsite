<?php

namespace App\Value;

enum Plan: string
{
    case Free = 'free';
    case Pro = 'pro';

    public function free(): bool
    {
        return $this === self::Free;
    }

    public function pro(): bool
    {
        return $this === self::Pro;
    }
}
