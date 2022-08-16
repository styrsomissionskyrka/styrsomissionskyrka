<?php

namespace StyrsoMissionskyrka;

use StyrsoMissionskyrka\Utils\AssetLoader;
use StyrsoMissionskyrka\Utils\HooksManager;

require_once __DIR__ . '/inc/polyfills.php';
require_once __DIR__ . '/vendor/autoload.php';

AssetLoader::prepare();
AssetLoader::enqueueAssets('admin');

$stripe_client = new \Stripe\StripeClient(STRIPE_SECRET_KEY);

$manager = new HooksManager();

$manager->register(new Core());
$manager->register(new PostTypes\Retreat\Api($stripe_client));
$manager->register(new PostTypes\Retreat\Editor());
$manager->register(new PostTypes\Retreat\PostType());
