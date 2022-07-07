<?php

namespace StyrsoMissionskyrka;

use StyrsoMissionskyrka\Utils\HooksManager;

require_once __DIR__ . '/inc/polyfills.php';
require_once __DIR__ . '/vendor/autoload.php';

AssetLoader::prepare();
AssetLoader::enqueueAssets('admin');

$manager = new HooksManager();
