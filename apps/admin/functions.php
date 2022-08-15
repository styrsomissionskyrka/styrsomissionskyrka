<?php

namespace StyrsoMissionskyrka;

use StyrsoMissionskyrka\PostTypes\Retreat;
use StyrsoMissionskyrka\Utils\AssetLoader;
use StyrsoMissionskyrka\Utils\HooksManager;

require_once __DIR__ . '/inc/polyfills.php';
require_once __DIR__ . '/vendor/autoload.php';

AssetLoader::prepare();
AssetLoader::enqueueAssets('admin');

$manager = new HooksManager();

$manager->register(new Core());
$manager->register(new Retreat\PostType());
$manager->register(new Retreat\Editor());
