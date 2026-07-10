<?php

namespace App\Contracts;

use App\Models\Violation;

interface ScoreCalculator
{
    /**
     * @param  list<int, Violation>  $violations
     */
    public function calculateHealthScore(array $violations): int;

    public function pointsDeduction(Violation $violation): int;
}
