<?php

namespace StyrsoMissionskyrka\Features\Retreats;

use StyrsoMissionskyrka\Utils\ActionHookSubscriber;

class PostType implements ActionHookSubscriber
{
  public static $name = 'retreat';

  public function getActions(): array
  {
    return [
      'init' => [['registerPostType'], ['registerPostMeta']],
    ];
  }

  public function registerPostType()
  {
    $labels = [
      'name' => __('Retreats', 'smk'),
      'singular_name' => __('Retreat', 'smk'),
      'add_new' => __('Add New', 'smk'),
      'add_new_item' => __('Add New Retreat', 'smk'),
      'edit_item' => __('Edit Retreat', 'smk'),
      'new_item' => __('New Retreat', 'smk'),
      'view_item' => __('View Retreat', 'smk'),
      'search_items' => __('Search Retreats', 'smk'),
      'not_found' => __('No Retreats found', 'smk'),
      'not_found_in_trash' => __('No Retreats found in Trash', 'smk'),
      'parent_item_colon' => __('Parent Retreat:', 'smk'),
      'menu_name' => __('Retreats', 'smk'),
    ];

    $args = [
      'label' => $labels['name'],
      'labels' => $labels,
      'description' => __('Retreat offerings', 'smk'),
      'public' => true,
      'hierarchical' => false,
      'show_in_rest' => true,
      'supports' => ['title', 'editor', 'revisions', 'custom-fields', 'thumbnail'],
      'has_archive' => true,
    ];

    \register_post_type(PostType::$name, $args);
  }

  public function registerPostMeta()
  {
    $meta_keys = [
      'stripe_product_ids' => [
        'type' => 'array',
        'description' => 'List of Stripe product IDs',
        'default' => [],
        'items' => [
          'type' => 'string',
          'description' => 'Stripe product ID',
        ],
        'single' => true,
        'show_in_rest' => [
          'schema' => [
            'type' => 'array',
            'default' => [],
            'items' => ['type' => 'string'],
          ],
        ],
      ],
    ];

    foreach ($meta_keys as $meta_key => $args) {
      \register_post_meta(PostType::$name, $meta_key, $args);
    }
  }
}
