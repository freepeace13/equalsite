<?php

namespace App\Actions\Audit;

use App\Contracts\ArtifactRepository;
use Illuminate\Support\Facades\File;
use ZipArchive;

class UnzipCrawlerArtifacts
{
    public function __construct(
        protected ArtifactRepository $repository
    ) {}

    public function unzip(string $crawlId, string $zipFilePath)
    {
        $zip = new ZipArchive;
        $destination = $this->repository->getPath($crawlId);

        if (! is_dir($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        if ($zip->open($zipFilePath) === true) {
            $zip->extractTo($destination);
            $zip->close();
        }
    }
}
