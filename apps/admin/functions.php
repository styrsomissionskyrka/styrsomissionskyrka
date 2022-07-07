<?php

namespace StyrsoMissionskyrka;

require_once __DIR__ . '/inc/polyfills.php';
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/inc/AssetLoader.php';

AssetLoader::prepare();

AssetLoader::enqueueAssets('admin');
