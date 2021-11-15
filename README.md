# Kirby Layout Grid

Custom grid templates with Kirby blocks and 12-col grid.

****

## Vocabulaire

- Groupes : ensemble des groupes dans la grille. Correspond à tous les enfants de `layoutgridstructure`

- Groupe : un "bloc visuel" dans la mise en page, qui englobe un ou plusieurs blocks Kirby. Correspond à un item de `layoutgridstructure`

- Block : un block Kirby, dépendant d'un champ type `blocks`. Correspond à un item de `layoutgridblocks`

****

## Dev: good to know

Actuellement, la création de nouveaux blocks dans un groupe fonctionne car :

1. Kirby va chercher la liste des blocs possibles (fieldsets) dans le blueprint de la page qui intègre l'élément Layout ou Blocks parent d'un block LayoutGrid (autrement dit, en dehors du plugin car dépendant de l'user).
*Pourquoi c'est comme ça aujourd'hui ?* Car Kirby génère automatiquement un `endpoints` (Object) qui se base sur le champ côté user (dans l'exemple ci-dessous, sur `textcontent`). → à faire évoluer pour utiliser `layoutgridblocks` ou `layoutgridblocksforfieldsets`

```yaml
title: Default Page
preset: page
fields:
  textcontent:
    label: Content
    type: layout
    layouts:
      - "1/1"
      - "1/2, 1/2"
      - "1/4, 1/4, 1/4, 1/4"
      - "1/1, 1/3, 2/3"
      - "1/1, 2/3, 1/3"
      - "1/2, 1/2, 1/3, 1/3, 1/3"
    fieldsets: # <= ici
      - heading
      - text
      - image
      - layoutgrid
      - button
      - quote
      - video
      - list
      - gallery
```

2. Du coup, le champ côté user (`textcontent`) et le champ du plugin (`layoutgridblocksforfieldsets`) doivent avoir les mêmes fieldsets. **Note : SAUF `layoutgridblocksforfieldsets` qui ne doit PAS avoir `layoutgrid` (sinon appel récursif et la page ne charge pas)**. → À essayer : définir un `endpoints` dans `LayoutGrid.vue` qui tape dans `layoutgridblocksforfieldsets` pour court-circuiter l'héritage de l'objet `endpoints` (note : il faudra possiblement tester  dans `props: {}` mais dans `methods: {}` ou `mounted: {}`

```yaml
name: Layout Grid
icon: grid
fields:
  layoutgridblocksforfieldsets:
    type: blocks
    fieldsets:
      - heading
      - text
      - image
      - button
    #  - layoutgrid
      - quote
      - video
      - list
      - gallery
  layoutgridstructure:
    type: structure
    fields:
      layoutgridblocks:
        type: blocks
      grid_row_start:
        type: text
      grid_column_start:
        type: text
      grid_row_end:
        type: text
      grid_column_end:
        type: text
```


## License

MIT

## Credits

- [Kévin Vennitti](https://github.com/kevinvennitti)
