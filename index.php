<?php

Kirby::plugin('kevinvennitti/layoutgrid', [
  'blueprints' => [
      'blocks/layoutgrid' => __DIR__ . '/blueprints/blocks/layoutgrid.yml',
      'blocks/layoutgriditem' => __DIR__ . '/blueprints/blocks/layoutgriditem.yml'
  ],
  // 'snippets' => [
  //     'blocks/layoutgrid' => __DIR__ . '/snippets/blocks/layoutgrid.php'
  // ]
]);
