<?php

namespace App\Support;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

class NodeCollection implements Arrayable, JsonSerializable
{
    public function __construct(
        protected array $nodes = []
    ) {}

    /**
     * @param  array{fingerprint: string, html: string, target: string, url: string}  $node
     */
    public function sync(array $node)
    {
        $fingerprint = md5($node['target'].$node['html']);

        $state = $this->nodes[$fingerprint] ?? [
            'fingerprint' => $fingerprint,
            'html' => $node['html'],
            'target' => $node['target'],
            'urls' => [],
        ];

        if (! in_array($node['url'], $state['urls'])) {
            $state['urls'][] = $node['url'];
        }

        $this->nodes[$fingerprint] = $state;
    }

    /**
     * @return array<string, array{
     *  fingerprint: string,
     *  html: string,
     *  target: string,
     *  urls: string[]
     * }>
     */
    public function toArray(): array
    {
        return $this->nodes;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
