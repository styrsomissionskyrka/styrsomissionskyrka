<?php

namespace StyrsoMissionskyrka;

require_once __DIR__ . '/inc/polyfills.php';
require_once __DIR__ . '/vendor/autoload.php';

\add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_scripts');

function enqueue_scripts()
{
	\wp_enqueue_script(
		'styrso-missionskyrka',
		\get_template_directory_uri() . '/dist/admin.global.js',
		[],
		'1.0.0',
		true
	);
}
