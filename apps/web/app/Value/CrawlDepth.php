<?php

namespace App\Value;

enum CrawlDepth: int
{
    case Shallow = 1;
    case Standard = 3;
    case Deep = 5;
}
