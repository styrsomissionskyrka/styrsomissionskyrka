<?php

namespace StyrsoMissionskyrka\PostTypes\Retreat;

use StyrsoMissionskyrka\Utils\ActionHookSubscriber;

class Api implements ActionHookSubscriber
{
  protected static $namespace = 'retreat-pricing';
  protected static $version = 'v1';

  /**
   * @var \Stripe\StripeClient
   */
  protected $stripe_client;

  public function __construct(\Stripe\StripeClient $stripe_client)
  {
    $this->stripe_client = $stripe_client;
  }

  protected static function getNamespace(): string
  {
    return self::$namespace . '/' . self::$version;
  }

  public function getActions()
  {
    return [
      'rest_api_init' => ['registerEndpoints'],
    ];
  }

  public function registerEndpoints()
  {
    $namespace = self::getNamespace();

    \register_rest_route($namespace, '/(?P<post_id>[\d|\w]+)/products', [
      'methods' => \WP_REST_Server::READABLE,
      'callback' => [$this, 'getProducts'],
      'permission_callback' => [$this, 'checkPermissions'],
    ]);

    \register_rest_route($namespace, '/(?P<post_id>[\d|\w]+)/products', [
      'methods' => \WP_REST_Server::CREATABLE,
      'callback' => [$this, 'createProduct'],
      'permission_callback' => [$this, 'checkPermissions'],
    ]);

    \register_rest_route($namespace, '/(?P<post_id>[\d|\w]+)/products/(?P<product_id>[\d|\w]+)', [
      'methods' => \WP_REST_Server::EDITABLE,
      'callback' => [$this, 'updateProduct'],
      'permission_callback' => [$this, 'checkPermissions'],
    ]);

    \register_rest_route($namespace, '/(?P<post_id>[\d|\w]+)/products/(?P<product_id>[\d|\w]+)/activate', [
      'methods' => \WP_REST_Server::EDITABLE,
      'callback' => [$this, 'activateProduct'],
      'permission_callback' => [$this, 'checkPermissions'],
    ]);
  }

  /**
   * Only people with the authority to edit others posts will be able to reach
   * these endpoints
   *
   * @param \WP_REST_Request $request
   * @return bool
   */
  public function checkPermissions(): bool
  {
    return \current_user_can('edit_others_posts');
  }

  public function getProducts(\WP_REST_Request $request): \WP_REST_Response
  {
    $post_id = $request->get_param('post_id');
    $product_ids = \get_post_meta($post_id, 'stripe_product_ids', true);

    if (\count($product_ids) === 0) {
      return new \WP_REST_Response([], 200);
    }

    $products = $this->stripe_client->products->all(['ids' => $product_ids, 'expand' => ['data.default_price']]);
    $json = $products->jsonSerialize();
    $response = new \WP_REST_Response($json['data']);

    return $response;
  }

  public function createProduct(\WP_REST_Request $request): \WP_REST_Response
  {
    $post_id = $request->get_param('post_id');
    $post = \get_post($post_id);
    $body = $request->get_json_params();

    if (empty($post)) {
      return new \WP_REST_Response([], 404);
    }

    $product = $this->stripe_client->products->create([
      'name' => $body['name'],
      'description' => $body['description'],
      'default_price_data' => [
        'currency' => 'sek',
        'unit_amount' => $body['price'],
      ],
      'metadata' => [
        'post_id' => $post_id,
      ],
      'expand' => ['default_price'],
    ]);

    $previous_product_ids = \get_post_meta($post_id, 'stripe_product_ids', true);
    \update_post_meta($post_id, 'stripe_product_ids', [...$previous_product_ids, $product->id], $previous_product_ids);

    return new \WP_REST_Response($product->jsonSerialize(), 200);
  }

  public function updateProduct(\WP_REST_Request $request): \WP_REST_Response
  {
    $post_id = $request->get_param('post_id');
    $product_id = $request->get_param('product_id');
    $post = \get_post($post_id);
    $body = $request->get_json_params();

    if (empty($post)) {
      return new \WP_REST_Response([], 404);
    }

    $product = $this->stripe_client->products->update($product_id, [
      'name' => $body['name'],
      'description' => $body['description'],
      'metadata' => [
        'post_id' => $post_id,
      ],

      'expand' => ['default_price'],
    ]);

    if ($product->default_price->unit_amount !== $body['price']) {
      $new_price = $this->stripe_client->prices->create([
        'product' => $product->id,
        'currency' => 'sek',
        'unit_amount' => $body['price'],
      ]);

      $product->updateAttributes(['default_price' => $new_price->id]);
      $product->save();
    }

    return new \WP_REST_Response($product->jsonSerialize(), 200);
  }

  public function activateProduct(\WP_REST_Request $request): \WP_REST_Response
  {
    $product_id = $request->get_param('product_id');
    $activate = $request->get_json_params()['activate'] ?? true;

    $product = $this->stripe_client->products->update($product_id, [
      'active' => $activate,
      'expand' => ['default_price'],
    ]);

    return new \WP_REST_Response($product->jsonSerialize(), 200);
  }
}
