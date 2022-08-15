<?php

namespace StyrsoMissionskyrka\PostTypes\Retreat;

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
    AssetLoader::enqueue('plugin-stripe', [], true);
  }
}
