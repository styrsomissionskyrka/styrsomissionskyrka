<?php

namespace StyrsoMissionskyrka\Features\Retreats;

use StyrsoMissionskyrka\Utils\ActionHookSubscriber;
use StyrsoMissionskyrka\Utils\AssetLoader;

class Editor implements ActionHookSubscriber
{
  public static $name = 'retreat';

  public function getActions(): array
  {
    return [
      'enqueue_block_editor_assets' => [['enqueuStripePlugin']],
    ];
  }

  public function enqueuStripePlugin()
  {
    $enqueued = AssetLoader::enqueue('editor-plugin-stripe', [], true);
  }
}
