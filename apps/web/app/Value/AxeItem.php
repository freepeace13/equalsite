<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

/**
 * @property string[] $tags
 * @property AxeNode[] $nodes
 */
class AxeItem implements Arrayable
{
    /**
     * @param  string[]  $tags
     * @param  AxeNode[]  $nodes
     */
    public function __construct(
        public readonly string $id,
        public readonly array $tags,
        public readonly string $description,
        public readonly string $help,
        public readonly string $helpUrl,
        public readonly array $nodes,
        public readonly ?string $impact,
        public readonly ?string $screenshotPath = null,
    ) {}

    public static function fromArray(array $array): static
    {
        return new static(
            id: $array['id'],
            impact: $array['impact'] ?? null,
            tags: $array['tags'],
            description: $array['description'],
            help: $array['help'],
            helpUrl: $array['helpUrl'],
            nodes: collect($array['nodes'])
                ->map(fn (array $i) => AxeNode::fromArray($i))
                ->all(),
            screenshotPath: $array['screenshotPath'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'impact' => $this->impact,
            'tags' => $this->tags,
            'description' => $this->description,
            'help' => $this->help,
            'helpUrl' => $this->helpUrl,
            'nodes' => collect($this->nodes)->toArray(),
            'screenshotPath' => $this->screenshotPath,
        ];
    }
}
