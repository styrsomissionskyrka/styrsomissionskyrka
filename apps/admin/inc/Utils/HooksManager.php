<?php

namespace StyrsoMissionskyrka\Utils;

/**
 * HooksManager handles registration and control of actions and filters that our
 * application needs to be hooked into the WordPress ecosystem.
 */
class HooksManager
{
  /**
   * Register a subscribers filters and actions and hook them into the
   * WordPress API.
   *
   * @param ActionHookSubscriber|FilterHookSubscriber $subscriber An instance of either ActionHookSubscriber or FilterHookSubscriber
   */
  public function register($subscriber)
  {
    if ($subscriber instanceof ActionHookSubscriber) {
      $this->registerActions($subscriber);
    }

    if ($subscriber instanceof FilterHookSubscriber) {
      $this->registerFilters($subscriber);
    }
  }

  /**
   * Register all actions of an ActionHookSubscriber into the WordPress API
   *
   * @param ActionHookSubscriber $subscriber ActionHookSubscriber with actions to register
   */
  protected function registerActions(ActionHookSubscriber $subscriber)
  {
    foreach ($subscriber->getActions() as $hook => $parameters) {
      if (is_array($parameters[0])) {
        foreach ($parameters as $params) {
          $this->registerAction($subscriber, $hook, $params);
        }
      } else {
        $this->registerAction($subscriber, $hook, $parameters);
      }
    }
  }

  /**
   * Register an action with the specified hook
   *
   * @param ActionHookSubscriber $subscriber ActionHookSubscriber to associate with the action
   * @param string $hook Action to register
   * @param array $parameters Parameters to attach to the call – first item in the array must be a string representing the callback on the subscriber-object
   */
  protected function registerAction(ActionHookSubscriber $subscriber, string $hook, array $parameters)
  {
    $callback = $parameters[0];
    $params = array_slice($parameters, 1);
    \add_action($hook, [$subscriber, $callback], ...$params);
  }

  /**
   * Register all filters of an FilterHookSubscriber into the WordPress API
   *
   * @param FilterHookSubscriber $subscriber FilterHookSubscriber with actions to register
   */
  protected function registerFilters(FilterHookSubscriber $subscriber)
  {
    foreach ($subscriber->getFilters() as $hook => $parameters) {
      if (is_array($parameters[0])) {
        foreach ($parameters as $params) {
          $this->registerFilter($subscriber, $hook, $params);
        }
      } else {
        $this->registerFilter($subscriber, $hook, $parameters);
      }
    }
  }

  /**
   * Register a filter with the specified hook
   *
   * @param FilterHookSubscriber $subscriber FilterHookSubscriber to associate with the action
   * @param string $hook Filter to register
   * @param array $parameters Parameters to attach to the call – first item in the array must be a string representing the callback on the subscriber-object
   */
  protected function registerFilter(FilterHookSubscriber $subscriber, string $hook, array $parameters)
  {
    $callback = $parameters[0];
    $params = array_slice($parameters, 1);
    \add_filter($hook, [$subscriber, $callback], ...$params);
  }
}
