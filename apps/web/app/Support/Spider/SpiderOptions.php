<?php

namespace App\Support\Spider;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;

class SpiderOptions implements Arrayable
{
    protected array $urls = [];

    protected bool $enqueueLinks = true;

    protected EnqueueStrategy $enqueueStrategy;

    protected int $maxPages = 50;

    protected ?int $maxDepth = null;

    protected array $includeGlobs = [];

    protected array $excludeGlobs = [];

    public function __construct(array $urls)
    {
        $this->urls = $urls;
        $this->enqueueStrategy = EnqueueStrategy::SameDomain;
    }

    /**
     * @param  string | list<int, string>  $urls
     */
    public static function make($urls): static
    {
        return new static(
            urls: is_string($urls) ? [$urls] : $urls,
        );
    }

    public static function fromArray(array $array): static
    {
        return tap(new static(
            urls: $array['urls'],
        ), function ($instance) use ($array) {
            if ($options = Arr::get($array, 'options', false)) {
                $instance->setOptions($options);
            }
        });
    }

    public function addUrl(string $url): self
    {
        if (! in_array($url, $this->urls)) {
            $this->urls[] = $url;
        }

        return $this;
    }

    public function getUrls(): array
    {
        return $this->urls;
    }

    public function getOptions(): array
    {
        return [
            'maxPages' => $this->getMaxPages(),
            'enqueueLinks' => $this->getEnqueueLinks(),
            'enqueueStrategy' => $this->getEnqueueStrategy(),
            'maxDepth' => $this->getMaxDepth(),
            'includeGlobs' => $this->getIncludeGlobs(),
            'excludeGlobs' => $this->getExcludeGlobs(),
        ];
    }

    public function setOptions(array $options): self
    {
        foreach ($options as $name => $value) {
            $this->setOption($name, $value);
        }

        return $this;
    }

    public function setOption(string $name, mixed $value): self
    {
        return value(match ($name) {
            'maxPages' => fn () => $this->setMaxPages($value),
            'enqueueLinks' => fn () => $this->setEnqueueLinks($value),
            'enqueueStrategy' => fn () => $this->setEnqueueStrategy($value),
            'maxDepth' => fn () => $this->setMaxDepth($value),
            'includeGlobs' => fn () => $this->setIncludeGlobs($value),
            'excludeGlobs' => fn () => $this->setExcludeGlobs($value),
            default => $this
        });
    }

    public function setMaxPages(int $value): self
    {
        $this->maxPages = $value;

        return $this;
    }

    public function getMaxPages(): int
    {
        return $this->maxPages;
    }

    public function setEnqueueLinks(bool $enable = true): self
    {
        $this->enqueueLinks = $enable;

        return $this;
    }

    public function getEnqueueLinks(): bool
    {
        return $this->enqueueLinks;
    }

    /**
     * @param  EnqueueStrategy|string  $value
     */
    public function setEnqueueStrategy($value): self
    {
        if (is_string($value)) {
            $value = EnqueueStrategy::from($value);
        }

        $this->enqueueStrategy = $value;

        return $this;
    }

    public function getEnqueueStrategy(): string
    {
        return $this->enqueueStrategy->value;
    }

    public function setMaxDepth(?int $value): self
    {
        $this->maxDepth = $value;

        return $this;
    }

    public function getMaxDepth(): ?int
    {
        return $this->maxDepth;
    }

    public function setIncludeGlobs(array $value): self
    {
        $this->includeGlobs = $value;

        return $this;
    }

    public function getIncludeGlobs(): array
    {
        return $this->includeGlobs;
    }

    public function setExcludeGlobs(array $value): self
    {
        $this->excludeGlobs = $value;

        return $this;
    }

    public function getExcludeGlobs(): array
    {
        return $this->excludeGlobs;
    }

    public function toArray(): array
    {
        return [
            'urls' => $this->getUrls(),
            'options' => $this->getOptions(),
        ];
    }
}
